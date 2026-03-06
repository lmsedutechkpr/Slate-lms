'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getInstructorStats(instructorId: string) {
  try {
    const supabase = await createClient();

    // 1. Course counts by status
    const { data: courses } = await supabase
      .from('courses')
      .select('status, id')
      .eq('instructor_id', instructorId);

    const totalCourses = courses?.length || 0;
    const publishedCourses = courses?.filter((c) => c.status === 'published').length || 0;
    const draftCourses = courses?.filter((c) => c.status === 'draft').length || 0;
    const pendingReviewCourses = courses?.filter((c) => c.status === 'pending_review').length || 0;
    
    const instructorCourseIds = courses?.map(c => c.id) || [];

    // 2. Total unique students
    let totalStudents = 0;
    let thisMonthStudents = 0;
    if (instructorCourseIds.length > 0) {
      const { count } = await supabase
        .from('enrollments')
        .select('student_id', { count: 'exact', head: true })
        .in('course_id', instructorCourseIds);
      totalStudents = count || 0;

      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { count: monthCount } = await supabase
        .from('enrollments')
        .select('student_id', { count: 'exact', head: true })
        .in('course_id', instructorCourseIds)
        .gte('enrolled_at', firstDayOfMonth.toISOString());
      thisMonthStudents = monthCount || 0;
    }

    // 3. Revenue
    let totalRevenue = 0;
    let thisMonthRevenue = 0;
    if (instructorCourseIds.length > 0) {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('unit_price, orders!inner(created_at, status)')
        .in('course_id', instructorCourseIds)
        .eq('item_type', 'course')
        .eq('orders.status', 'paid');

      if (orderItems) {
        totalRevenue = orderItems.reduce((sum, item) => sum + (Number(item.unit_price) || 0), 0);
        
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        firstDayOfMonth.setHours(0, 0, 0, 0);

        thisMonthRevenue = orderItems
          .filter(item => new Date((item.orders as any).created_at) >= firstDayOfMonth)
          .reduce((sum, item) => sum + (Number(item.unit_price) || 0), 0);
      }
    }

    // 4. Average rating
    let avgRating = 0;
    let totalReviews = 0;
    if (instructorCourseIds.length > 0) {
      const { data: reviews } = await supabase
        .from('course_reviews')
        .select('rating')
        .in('course_id', instructorCourseIds);
      
      if (reviews && reviews.length > 0) {
        totalReviews = reviews.length;
        avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
      }
    }

    return {
      totalCourses,
      publishedCourses,
      draftCourses,
      pendingReviewCourses,
      totalStudents,
      totalRevenue,
      netRevenue: totalRevenue * 0.7,
      thisMonthRevenue,
      thisMonthStudents,
      avgRating,
      totalReviews,
    };
  } catch (error) {
    console.error('Error in getInstructorStats:', error);
    return {
      totalCourses: 0,
      publishedCourses: 0,
      draftCourses: 0,
      pendingReviewCourses: 0,
      totalStudents: 0,
      totalRevenue: 0,
      netRevenue: 0,
      thisMonthRevenue: 0,
      thisMonthStudents: 0,
      avgRating: 0,
      totalReviews: 0,
    };
  }
}

export async function getInstructorCourses(instructorId: string) {
  try {
    const supabase = await createClient();

    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        category:categories (name, slug, color),
        sections:course_sections (
          id,
          lectures:lectures (id)
        )
      `)
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Enrich courses with lecture counts and revenue
    const courseIds = courses.map(c => c.id);
    
    const { data: revenueData } = await supabase
      .from('order_items')
      .select('course_id, unit_price, orders!inner(status)')
      .in('course_id', courseIds)
      .eq('item_type', 'course')
      .eq('orders.status', 'paid');

    const { data: enrollmentCounts } = await supabase
      .from('enrollments')
      .select('course_id', { count: 'exact', head: false })
      .in('course_id', courseIds);

    return courses.map(course => {
      const courseRevenue = revenueData
        ?.filter(item => item.course_id === course.id)
        .reduce((sum, item) => sum + (Number(item.unit_price) || 0), 0) || 0;
      
      const courseEnrollments = enrollmentCounts?.filter(e => e.course_id === course.id).length || 0;
      
      const lectureCount = course.sections?.reduce((sum: number, section: any) => sum + (section.lectures?.length || 0), 0) || 0;

      return {
        ...course,
        revenue: courseRevenue,
        enrollmentCount: courseEnrollments,
        lectureCount
      };
    });
  } catch (error) {
    console.error('Error in getInstructorCourses:', error);
    return [];
  }
}

export async function createCourse(data: {
  instructorId: string;
  title: string;
  description: string;
  categoryId: string;
  difficulty: string;
  language: string;
  price: number;
  tags?: string[];
}) {
  try {
    const supabase = await createClient();

    if (!data.title || data.title.length < 10) {
      return { success: false, error: 'Title must be at least 10 characters' };
    }
    if (!data.description || data.description.length < 50) {
      return { success: false, error: 'Description must be at least 50 characters' };
    }
    if (data.price < 0) {
      return { success: false, error: 'Price must be non-negative' };
    }

    let slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check slug uniqueness
    const { data: existingCourse } = await supabase
      .from('courses')
      .select('slug')
      .eq('slug', slug)
      .single();

    if (existingCourse) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        instructor_id: data.instructorId,
        title: data.title,
        description: data.description,
        slug,
        category_id: data.categoryId,
        difficulty: data.difficulty,
        language: data.language,
        price: data.price,
        status: 'draft',
        tags: data.tags || [],
        enrollment_count: 0,
        rating: 0,
        rating_count: 0,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/instructor/courses');
    return { success: true, courseId: course.id };
  } catch (error: any) {
    console.error('Error in createCourse:', error);
    return { success: false, error: error.message };
  }
}

export async function updateCourse(
  courseId: string,
  instructorId: string,
  data: {
    title?: string;
    description?: string;
    category_id?: string;
    difficulty?: string;
    language?: string;
    price?: number;
    what_you_learn?: string[];
    requirements?: string[];
    tags?: string[];
    promo_video_url?: string;
    thumbnail_url?: string;
  }
) {
  try {
    const supabase = await createClient();

    // 1. Verify ownership and check status
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id, status')
      .eq('id', courseId)
      .single();

    if (!course || course.instructor_id !== instructorId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (course.status === 'pending_review') {
      return { success: false, error: 'Cannot edit while under review' };
    }

    // 2. Validate data
    if (data.title && data.title.length < 10) {
      return { success: false, error: 'Title must be at least 10 characters' };
    }
    if (data.description && data.description.length < 50) {
      return { success: false, error: 'Description must be at least 50 characters' };
    }
    if (data.price !== undefined && data.price < 0) {
      return { success: false, error: 'Price must be non-negative' };
    }

    // 3. Update
    const { error } = await supabase
      .from('courses')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId);

    if (error) throw error;

      revalidatePath(`/instructor/courses/${courseId}`);
      revalidatePath(`/instructor/courses/${courseId}/edit`);
      revalidatePath(`/instructor/courses/${courseId}/curriculum`);
      revalidatePath('/instructor/courses');
      revalidatePath('/instructor/dashboard');
      return { success: true };
  } catch (error: any) {
    console.error('Error in updateCourse:', error);
    return { success: false, error: error.message };
  }
}

export async function createSection(
  courseId: string,
  instructorId: string,
  title: string
) {
  try {
    const supabase = await createClient();

    // Verify ownership
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single();

    if (!course || course.instructor_id !== instructorId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get max order_index
    const { data: sections } = await supabase
      .from('course_sections')
      .select('order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextIndex = (sections?.[0]?.order_index ?? -1) + 1;

    const { data: section, error } = await supabase
      .from('course_sections')
      .insert({
        course_id: courseId,
        title,
        order_index: nextIndex
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath(`/instructor/courses/${courseId}/curriculum`);
    return { success: true, sectionId: section.id };
  } catch (error: any) {
    console.error('Error in createSection:', error);
    return { success: false, error: error.message };
  }
}

export async function createLecture(
  sectionId: string,
  instructorId: string,
  data: {
    title: string;
    content_type: 'video' | 'text' | 'quiz';
    duration_minutes?: number;
    is_preview?: boolean;
  }
) {
  try {
    const supabase = await createClient();

    // Verify ownership via section -> course
    const { data: sectionData } = await supabase
      .from('course_sections')
      .select('course_id, courses(instructor_id)')
      .eq('id', sectionId)
      .single();

    if (!sectionData || (sectionData.courses as any).instructor_id !== instructorId) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: lectures } = await supabase
      .from('lectures')
      .select('order_index')
      .eq('section_id', sectionId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextIndex = (lectures?.[0]?.order_index ?? -1) + 1;

      const { data: lecture, error } = await supabase
        .from('lectures')
        .insert({
          section_id: sectionId,
          course_id: sectionData.course_id,
          title: data.title,
          content_type: data.content_type,
          duration_minutes: data.duration_minutes || 0,
          is_free_preview: data.is_preview || false,
          order_index: nextIndex
        })
      .select()
      .single();

    if (error) throw error;

    revalidatePath(`/instructor/courses/${sectionData.course_id}/curriculum`);
    return { success: true, lectureId: lecture.id };
  } catch (error: any) {
    console.error('Error in createLecture:', error);
    return { success: false, error: error.message };
  }
}

export async function updateSection(sectionId: string, instructorId: string, data: any) {
  try {
    const supabase = await createClient();

    // Verify ownership
    const { data: sectionData } = await supabase
      .from('course_sections')
      .select('course_id, courses(instructor_id)')
      .eq('id', sectionId)
      .single();

    if (!sectionData || (sectionData.courses as any).instructor_id !== instructorId) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('course_sections')
      .update(data)
      .eq('id', sectionId);

    if (error) throw error;

    revalidatePath(`/instructor/courses/${sectionData.course_id}/curriculum`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLecture(lectureId: string, instructorId: string, data: any) {
  try {
    const supabase = await createClient();

    // Verify ownership
    const { data: lectureData } = await supabase
      .from('lectures')
      .select('section_id, course_sections(course_id, courses(instructor_id))')
      .eq('id', lectureId)
      .single();

    if (!lectureData || (lectureData.course_sections as any).courses.instructor_id !== instructorId) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('lectures')
      .update(data)
      .eq('id', lectureId);

    if (error) throw error;

    revalidatePath(`/instructor/courses/${(lectureData.course_sections as any).course_id}/curriculum`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSection(sectionId: string, instructorId: string) {
  try {
    const supabase = await createClient();

    // Verify ownership
    const { data: sectionData } = await supabase
      .from('course_sections')
      .select('course_id, courses(instructor_id)')
      .eq('id', sectionId)
      .single();

    if (!sectionData || (sectionData.courses as any).instructor_id !== instructorId) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('course_sections')
      .delete()
      .eq('id', sectionId);

    if (error) throw error;

    revalidatePath(`/instructor/courses/${sectionData.course_id}/curriculum`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLecture(lectureId: string, instructorId: string) {
  try {
    const supabase = await createClient();

    // Verify ownership
    const { data: lectureData } = await supabase
      .from('lectures')
      .select('section_id, course_sections(course_id, courses(instructor_id))')
      .eq('id', lectureId)
      .single();

    if (!lectureData || (lectureData.course_sections as any).courses.instructor_id !== instructorId) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('lectures')
      .delete()
      .eq('id', lectureId);

    if (error) throw error;

    revalidatePath(`/instructor/courses/${(lectureData.course_sections as any).course_id}/curriculum`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitCourseForReview(courseId: string, instructorId: string) {
  try {
    const supabase = await createClient();

    // 1. Verify ownership and details
    const { data: course } = await supabase
      .from('courses')
      .select('*, sections:course_sections(id, lectures:lectures(id))')
      .eq('id', courseId)
      .single();

    if (!course || course.instructor_id !== instructorId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (course.status !== 'draft' && course.status !== 'rejected') {
      return { success: false, error: 'Course status must be draft or rejected to submit' };
    }

    // 2. Instructor approval check
    const { data: profile } = await supabase
      .from('profiles')
      .select('approval_status, full_name')
      .eq('id', instructorId)
      .single();

    if (profile?.approval_status !== 'approved') {
      return { success: false, error: 'Instructor account must be approved before publishing' };
    }

    // 3. Checklist validation
    if (!course.title || course.title.length < 10) {
      return { success: false, error: 'Title must be at least 10 characters' };
    }
    if (!course.description || course.description.length < 50) {
      return { success: false, error: 'Description must be at least 50 characters' };
    }
    if (!course.category_id) {
      return { success: false, error: 'Choose a category for your course' };
    }
    if (!course.thumbnail_url) {
      return { success: false, error: 'Upload a course cover image' };
    }
    if (!course.what_you_learn || course.what_you_learn.length < 4) {
      return { success: false, error: 'Add at least 4 learning outcomes' };
    }
    
    if (!course.sections || course.sections.length < 1) {
      return { success: false, error: 'Create at least 1 section' };
    }
    
    const totalLectures = course.sections?.reduce((sum: number, s: any) => sum + (s.lectures?.length || 0), 0) || 0;
    if (totalLectures < 3) {
      return { success: false, error: 'Add at least 3 lectures to your course' };
    }

    if (course.price === null || course.price === undefined) {
      return { success: false, error: 'Set a price for your course' };
    }

    // 4. Update course status
    const { error: updateError } = await supabase
      .from('courses')
      .update({
        status: 'pending_review',
        submitted_at: new Date().toISOString()
      })
      .eq('id', courseId);

    if (updateError) throw updateError;

    // 5. Notify admins
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (admins) {
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        type: 'system',
        title: 'Course submitted for review',
        message: `${profile.full_name} submitted "${course.title}" for review`,
        link: `/admin/courses/${courseId}`,
      }));

      await supabase.from('notifications').insert(notifications);
    }

      revalidatePath(`/instructor/courses/${courseId}`);
      revalidatePath(`/instructor/courses/${courseId}/edit`);
      revalidatePath(`/instructor/courses/${courseId}/curriculum`);
      revalidatePath('/instructor/courses');
      revalidatePath('/instructor/dashboard');
      return { success: true };
  } catch (error: any) {
    console.error('Error in submitCourseForReview:', error);
    return { success: false, error: error.message };
  }
}

export async function getEnrolledStudents(instructorId: string, courseId?: string) {
  try {
    const supabase = await createClient();

    // Get all courses by this instructor
    const { data: courses } = await supabase
      .from('courses')
      .select('id')
      .eq('instructor_id', instructorId);

    const instructorCourseIds = courses?.map(c => c.id) || [];

    if (instructorCourseIds.length === 0) return [];

    let query = supabase
      .from('enrollments')
      .select(`
        *,
        student:profiles (
          id, full_name, avatar_url, email,
          created_at
        ),
        course:courses (
          id, title, slug
        )
      `)
      .in('course_id', instructorCourseIds);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query.order('enrolled_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in getEnrolledStudents:', error);
    return [];
  }
}

export async function getThumbnailUploadUrl(courseId: string, instructorId: string, fileExt: string) {
  try {
    const supabase = await createClient();

    // Verify ownership
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single();

    if (!course || course.instructor_id !== instructorId) {
      return { success: false, error: 'Unauthorized' };
    }

    const path = `courses/${instructorId}/${courseId}.${fileExt}`;
    
    return { success: true, path };
  } catch (error: any) {
    console.error('Error in getThumbnailUploadUrl:', error);
    return { success: false, error: error.message };
  }
}

export async function uploadCourseThumbnail(
  courseId: string,
  instructorId: string,
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify ownership
    const { data: course } = await supabase
      .from('courses')
      .select('id, instructor_id')
      .eq('id', courseId)
      .single();

    if (!course || course.instructor_id !== instructorId) {
      return { success: false, error: 'Unauthorized' };
    }

    const file = formData.get('thumbnail') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Only JPG, PNG, WebP allowed' };
    }

    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: 'File must be under 2MB' };
    }

    const ext = file.name.split('.').pop() ?? file.type.split('/')[1];
    const path = `courses/${instructorId}/${courseId}.${ext}`;
    const buffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from('course-thumbnails')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: 'Upload failed. Try again.' };
    }

    const { data: urlData } = supabase.storage
      .from('course-thumbnails')
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from('courses')
      .update({ thumbnail_url: publicUrl })
      .eq('id', courseId);

    if (updateError) {
      return { success: false, error: 'Saved file but could not update course.' };
    }

    revalidatePath(`/instructor/courses/${courseId}`);
    revalidatePath(`/instructor/courses/${courseId}/edit`);
    revalidatePath(`/instructor/courses/${courseId}/curriculum`);
    revalidatePath('/instructor/courses');
    revalidatePath('/instructor/dashboard');
    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error('Error in uploadCourseThumbnail:', error);
    return { success: false, error: error.message };
  }
}

export async function getEarningsData(instructorId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('instructor_earnings')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('month', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in getEarningsData:', error);
    return [];
  }
}

export async function getInstructorCourseDetails(courseId: string, instructorId: string) {
  try {
    const supabase = await createClient();

    // 1. Fetch course with category and sections/lectures
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        category:categories (id, name, slug),
        sections:course_sections (
          id,
          lectures:lectures (id)
        )
      `)
      .eq('id', courseId)
      .eq('instructor_id', instructorId)
      .single();

    if (error || !course) return null;

    // 2. Counts
    const sectionCount = course.sections?.length || 0;
    const lectureCount = course.sections?.reduce((sum: number, s: any) => sum + (s.lectures?.length || 0), 0) || 0;

    // 3. Enrollment count
    const { count: enrollmentCount } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    // 4. Revenue
    const { data: revenueData } = await supabase
      .from('order_items')
      .select('unit_price, orders!inner(status)')
      .eq('course_id', courseId)
      .eq('item_type', 'course')
      .eq('orders.status', 'paid');

    const totalRevenue = revenueData?.reduce((sum, item) => sum + (Number(item.unit_price) || 0), 0) || 0;

    // 5. Recent 5 enrollments
    const { data: recentEnrollments } = await supabase
      .from('enrollments')
      .select(`
        *,
        student:profiles (id, full_name, avatar_url, email)
      `)
      .eq('course_id', courseId)
      .order('enrolled_at', { ascending: false })
      .limit(5);

    // 6. Checklist calculation
    const completedItems = [];
    if (course.title && course.title.length >= 10) completedItems.push('title');
    if (course.description && course.description.length >= 50) completedItems.push('description');
    if (course.category_id) completedItems.push('category');
    if (course.thumbnail_url) completedItems.push('thumbnail');
    if (course.what_you_learn && course.what_you_learn.length >= 4) completedItems.push('what_you_learn');
    if (sectionCount >= 1) completedItems.push('sections');
    if (lectureCount >= 3) completedItems.push('lectures');
    if (course.price !== null && course.price !== undefined && course.price >= 0) completedItems.push('price');

    return {
      course,
      sectionCount,
      lectureCount,
      enrollmentCount: enrollmentCount || 0,
      totalRevenue,
      recentEnrollments: recentEnrollments || [],
      checklist: {
        completedCount: completedItems.length,
        totalCount: 8,
        items: {
          title: completedItems.includes('title'),
          description: completedItems.includes('description'),
          category: completedItems.includes('category'),
          thumbnail: completedItems.includes('thumbnail'),
          what_you_learn: completedItems.includes('what_you_learn'),
          sections: completedItems.includes('sections'),
          lectures: completedItems.includes('lectures'),
          price: completedItems.includes('price'),
        }
      }
    };
  } catch (error) {
    console.error('Error in getInstructorCourseDetails:', error);
    return null;
  }
}

export async function getInstructorCourse(courseId: string, instructorId: string) {
  try {
    const supabase = await createClient();

    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        category:categories (id, name, slug),
        sections:course_sections (
          id,
          title,
          order_index,
            lectures:lectures (
              id,
              title,
              content_type,
              duration_minutes,
              is_free_preview,
              order_index,
              video_url,
              content
            )
        )
      `)
      .eq('id', courseId)
      .eq('instructor_id', instructorId)
      .single();

    if (error) throw error;

    // Sort sections and lectures by order_index
    if (course.sections) {
      course.sections.sort((a: any, b: any) => a.order_index - b.order_index);
      course.sections.forEach((section: any) => {
        if (section.lectures) {
          section.lectures.sort((a: any, b: any) => a.order_index - b.order_index);
        }
      });
    }

    return course;
  } catch (error) {
    console.error('Error in getInstructorCourse:', error);
    return null;
  }
}
