'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ─── Dashboard Stats ────────────────────────────────────────────────────────

export async function getAdminDashboardStats() {
  try {
    const supabase = await createClient();

    const [
      { count: studentCount },
      { count: instructorCount },
      { count: sellerCount },
      { count: publishedCount },
      { count: pendingCount },
      { count: enrollmentCount },
      { count: pendingInstructorCount },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'instructor'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
      supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['instructor', 'seller']).eq('approval_status', 'pending'),
    ]);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: newThisWeek } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student')
      .gte('created_at', weekAgo.toISOString());

    const { data: earningsData } = await supabase.from('earnings').select('gross_amount, net_amount, platform_fee');
    const grossRevenue = earningsData?.reduce((s, e) => s + (e.gross_amount || 0), 0) || 0;
    const platformRevenue = earningsData?.reduce((s, e) => s + (e.platform_fee || 0), 0) || 0;

    const { data: pendingCourseReviews } = await supabase
      .from('courses')
      .select(`
        id, title, thumbnail_url, price, submitted_at, difficulty,
        instructor:profiles!instructor_id(full_name, avatar_url),
        category:categories(name)
      `)
      .eq('status', 'pending_review')
      .order('submitted_at', { ascending: true })
      .limit(5);

    const { data: pendingInstructorsList } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, created_at, role')
      .in('role', ['instructor', 'seller'])
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: true })
      .limit(5);

    const { data: recentEnrollments } = await supabase
      .from('enrollments')
      .select(`
        id, enrolled_at, amount_paid,
        student:profiles!student_id(full_name, avatar_url),
        course:courses!course_id(title, thumbnail_url)
      `)
      .order('enrolled_at', { ascending: false })
      .limit(5);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: recentEarnings } = await supabase
      .from('earnings')
      .select('gross_amount, platform_fee, created_at')
      .gte('created_at', sevenDaysAgo.toISOString());

    // Generate last 7 days chart data
    const revenueChartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      // Filter earnings for this day
      const dayEarnings = (recentEarnings || []).filter(e => {
        const itemDate = new Date(e.created_at);
        return itemDate.getDate() === d.getDate() && itemDate.getMonth() === d.getMonth();
      });
      const gross = dayEarnings.reduce((sum, e) => sum + (e.gross_amount || 0), 0);
      const platform = dayEarnings.reduce((sum, e) => sum + (e.platform_fee || 0), 0);
      return { name: dateStr, gross, platform };
    });

    const roleBreakdown = [
      { name: 'Students', value: studentCount || 0, fill: '#3b82f6' },
      { name: 'Instructors', value: instructorCount || 0, fill: '#a855f7' },
      { name: 'Sellers', value: sellerCount || 0, fill: '#eab308' },
    ];

    return {
      studentCount: studentCount || 0,
      instructorCount: instructorCount || 0,
      publishedCount: publishedCount || 0,
      pendingCount: pendingCount || 0,
      enrollmentCount: enrollmentCount || 0,
      pendingInstructorCount: pendingInstructorCount || 0,
      newThisWeek: newThisWeek || 0,
      grossRevenue,
      platformRevenue,
      pendingCourseReviews: (pendingCourseReviews || []) as any[],
      pendingInstructorsList: (pendingInstructorsList || []) as any[],
      recentEnrollments: (recentEnrollments || []) as any[],
      revenueChartData,
      roleBreakdown,
    };
  } catch (error) {
    console.error('getAdminDashboardStats error:', error);
    return {
      studentCount: 0,
      instructorCount: 0,
      publishedCount: 0,
      pendingCount: 0,
      enrollmentCount: 0,
      pendingInstructorCount: 0,
      newThisWeek: 0,
      grossRevenue: 0,
      platformRevenue: 0,
      pendingCourseReviews: [],
      pendingInstructorsList: [],
      recentEnrollments: [],
      revenueChartData: [],
      roleBreakdown: [],
    };
  }
}

// ─── Instructor Management ───────────────────────────────────────────────────

export async function getAdminInstructors(
  filter?: 'all' | 'pending' | 'approved' | 'rejected'
) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'instructor')
      .order('created_at', { ascending: false });

    if (filter && filter !== 'all') {
      query = query.eq('approval_status', filter);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Enrich with course counts
    const ids = (data || []).map((p) => p.id);
    const { data: courseCounts } = await supabase
      .from('courses')
      .select('instructor_id, status')
      .in('instructor_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);

    return (data || []).map((profile) => {
      const courses = courseCounts?.filter((c) => c.instructor_id === profile.id) || [];
      return {
        ...profile,
        totalCourses: courses.length,
        publishedCourses: courses.filter((c) => c.status === 'published').length,
        pendingCourses: courses.filter((c) => c.status === 'pending_review').length,
      };
    });
  } catch (error) {
    console.error('getAdminInstructors error:', error);
    return [];
  }
}

export async function getAdminInstructorDetail(instructorId: string) {
  try {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', instructorId)
      .single();

    if (error || !profile) return null;

    const { data: courses } = await supabase
      .from('courses')
      .select(
        'id, title, status, price, enrollment_count, rating, created_at, submitted_at, thumbnail_url, category:categories(name)'
      )
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false });

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .in(
        'course_id',
        (courses || []).map((c) => c.id).length
          ? (courses || []).map((c) => c.id)
          : ['00000000-0000-0000-0000-000000000000']
      );

    const { data: earnings } = await supabase
      .from('earnings')
      .select('gross_amount')
      .eq('instructor_id', instructorId);

    const totalRevenue = earnings?.reduce((sum, e) => sum + (e.gross_amount || 0), 0) || 0;

    return {
      profile,
      courses: courses || [],
      totalStudents: enrollments?.length || 0,
      totalRevenue,
    };
  } catch (error) {
    console.error('getAdminInstructorDetail error:', error);
    return null;
  }
}

export async function approveInstructor(instructorId: string) {
  try {
    const supabase = await createClient();

    const { data: instructor } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', instructorId)
      .single();

    const { error } = await supabase
      .from('profiles')
      .update({ approval_status: 'approved' })
      .eq('id', instructorId);

    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: instructorId,
      type: 'system',
      title: '✅ Instructor Account Approved!',
      message:
        'Your instructor account has been approved. You can now create and publish courses on Slate.',
      link: '/instructor/dashboard',
    });

    revalidatePath('/admin/instructors');
    revalidatePath(`/admin/instructors/${instructorId}`);
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectInstructor(instructorId: string, reason: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('profiles')
      .update({ approval_status: 'rejected' })
      .eq('id', instructorId);

    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: instructorId,
      type: 'system',
      title: 'Instructor Application Update',
      message: `Your instructor application was not approved. Reason: ${reason}`,
      link: '/settings',
    });

    revalidatePath('/admin/instructors');
    revalidatePath(`/admin/instructors/${instructorId}`);
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function suspendInstructor(instructorId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('profiles')
      .update({ status: 'suspended', approval_status: 'suspended' })
      .eq('id', instructorId);

    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: instructorId,
      type: 'system',
      title: 'Account Suspended',
      message: 'Your instructor account has been suspended. Please contact support.',
      link: '/support',
    });

    revalidatePath('/admin/instructors');
    revalidatePath(`/admin/instructors/${instructorId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Course Management ───────────────────────────────────────────────────────

export async function getAdminCourses(
  filter?: 'all' | 'pending_review' | 'published' | 'draft' | 'rejected' | 'archived'
) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('courses')
      .select(`
        id,
        title,
        slug,
        description,
        thumbnail_url,
        price,
        status,
        difficulty,
        language,
        created_at,
        what_you_learn,
        requirements,
        tags,
        instructor_id,
        instructor:profiles!instructor_id(
          id,
          full_name,
          email,
          avatar_url,
          approval_status
        ),
        category:categories(
          id,
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false });

    if (filter && filter !== 'all') {
      query = (query as any).eq('status', filter);
    }

    const { data: courses, error } = await query;
    if (error) throw error;

    if (!courses || courses.length === 0) return [];

    const { data: enrollmentCounts } = await supabase
      .from('enrollments')
      .select('course_id')
      .in('course_id', courses.map((c: any) => c.id));

    const enrollmentMap = enrollmentCounts?.reduce(
      (acc: any, e: any) => {
        acc[e.course_id] = (acc[e.course_id] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>
    ) ?? {};

    return courses.map((c: any) => ({
      ...c,
      enrollmentCount: enrollmentMap[c.id] ?? 0,
    }));
  } catch (error: any) {
    console.error('getAdminCourses error:', error.message, error.details);
    return [];
  }
}

export async function getAdminCourseDetail(courseId: string) {
  try {
    const supabase = await createClient();

    const { data: course, error } = await supabase
      .from('courses')
      .select(
        `id,
        title,
        slug,
        description,
        thumbnail_url,
        price,
        status,
        difficulty,
        language,
        created_at,
        what_you_learn,
        requirements,
        tags,
        instructor_id,
        instructor:profiles!instructor_id(
          id, 
          full_name, 
          avatar_url, 
          email, 
          approval_status, 
          bio, 
          headline
        ),
        category:categories(
          id, 
          name, 
          slug
        ),
        sections:course_sections(
          id, title, order_index,
          lectures:lectures(id, title, content_type, duration_minutes, is_free_preview, order_index)
        )`
      )
      .eq('id', courseId)
      .single();

    if (error || !course) return null;

    if (course.sections) {
      course.sections.sort((a: any, b: any) => a.order_index - b.order_index);
      course.sections.forEach((s: any) => {
        if (s.lectures) s.lectures.sort((a: any, b: any) => a.order_index - b.order_index);
      });
    }

    const sectionCount = course.sections?.length || 0;
    const lectureCount =
      course.sections?.reduce(
        (s: number, sec: any) => s + (sec.lectures?.length || 0),
        0
      ) || 0;

    const { count: enrollmentCount } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    const { data: reviews } = await supabase
      .from('course_reviews')
      .select(
        'rating, comment, created_at, student:profiles!student_id(full_name, avatar_url)'
      )
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .limit(10);

    const avgRating =
      reviews && reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;

    return {
      course,
      sectionCount,
      lectureCount,
      enrollmentCount: enrollmentCount || 0,
      reviews: reviews || [],
      avgRating: Math.round(avgRating * 10) / 10,
    };
  } catch (error) {
    console.error('getAdminCourseDetail error:', error);
    return null;
  }
}

export async function approveCourse(courseId: string) {
  try {
    const supabase = await createClient();

    const { data: course } = await supabase
      .from('courses')
      .select('title, slug, instructor_id')
      .eq('id', courseId)
      .single();

    if (!course) return { success: false, error: 'Course not found' };

    const { error } = await supabase
      .from('courses')
      .update({
        status: 'published',
        approved_at: new Date().toISOString(),
        rejection_reason: null,
      })
      .eq('id', courseId);

    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: course.instructor_id,
      type: 'system',
      title: '🎉 Course Approved & Published!',
      message: `Your course "${course.title}" has been approved and is now live on Slate!`,
      link: `/instructor/courses/${courseId}`,
    });

    revalidatePath('/admin/courses');
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath('/admin/dashboard');
    revalidatePath('/courses');
    if (course.slug) revalidatePath(`/courses/${course.slug}`);
    revalidatePath(`/instructor/courses/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectCourse(courseId: string, reason: string) {
  try {
    const supabase = await createClient();

    if (!reason?.trim()) {
      return { success: false, error: 'Rejection reason is required' };
    }

    const { data: course } = await supabase
      .from('courses')
      .select('title, instructor_id')
      .eq('id', courseId)
      .single();

    if (!course) return { success: false, error: 'Course not found' };

    const { error } = await supabase
      .from('courses')
      .update({
        status: 'rejected',
        rejection_reason: reason.trim(),
      })
      .eq('id', courseId);

    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: course.instructor_id,
      type: 'system',
      title: 'Course Needs Changes',
      message: `Your course "${course.title}" was not approved. Reason: ${reason}`,
      link: `/instructor/courses/${courseId}`,
    });

    revalidatePath('/admin/courses');
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath('/admin/dashboard');
    revalidatePath(`/instructor/courses/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function unpublishCourse(courseId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('courses')
      .update({ status: 'archived', approved_at: null })
      .eq('id', courseId);

    if (error) throw error;

    revalidatePath('/admin/courses');
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath('/admin/dashboard');
    revalidatePath('/courses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCourse(courseId: string) {
  try {
    const supabase = await createClient();
    
    // Check if course exists first
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .single();
      
    if (!course) return { success: false, error: 'Course not found' };

    // Since we assume cascading deletes on the DB level, just delete the course.
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) throw error;

    revalidatePath('/admin/courses');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Student Management ──────────────────────────────────────────────────────

export async function getAdminStudents() {
  try {
    const supabase = await createClient();

    const { data: students, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const ids = (students || []).map((s) => s.id);
    if (!ids.length) return [];

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('student_id')
      .in('student_id', ids);

    return (students || []).map((student) => ({
      ...student,
      enrollmentCount:
        enrollments?.filter((e) => e.student_id === student.id).length || 0,
    }));
  } catch (error) {
    console.error('getAdminStudents error:', error);
    return [];
  }
}

// ─── Category Management ─────────────────────────────────────────────────────

export async function getAdminCategories() {
  try {
    const supabase = await createClient();

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;

    const ids = (categories || []).map((c) => c.id);
    const { data: courseCounts } = await supabase
      .from('courses')
      .select('category_id, status')
      .in('category_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);

    return (categories || []).map((cat) => ({
      ...cat,
      courseCount: courseCounts?.filter((c) => c.category_id === cat.id).length || 0,
      publishedCount:
        courseCounts?.filter(
          (c) => c.category_id === cat.id && c.status === 'published'
        ).length || 0,
    }));
  } catch (error) {
    console.error('getAdminCategories error:', error);
    return [];
  }
}

export async function createCategory(data: {
  name: string;
  name_ta?: string;
  icon?: string;
  color?: string;
  description?: string;
}) {
  try {
    const supabase = await createClient();
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const { error } = await supabase.from('categories').insert({ ...data, slug });
    if (error) throw error;

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    name_ta: string;
    icon: string;
    color: string;
    description: string;
  }>
) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('categories').update(data).eq('id', id);
    if (error) throw error;

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    const supabase = await createClient();

    const { count } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (count && count > 0) {
      return {
        success: false,
        error: `Cannot delete: ${count} course(s) use this category`,
      };
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Seller Management ───────────────────────────────────────────────────────

export async function getAdminSellers(
  filter?: 'all' | 'pending' | 'approved' | 'rejected'
) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'vendor')
      .order('created_at', { ascending: false });

    if (filter && filter !== 'all') {
      query = query.eq('approval_status', filter);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Enrich with product counts
    const ids = (data || []).map((p) => p.id);
    const { data: productCounts } = await supabase
      .from('products')
      .select('vendor_id, status')
      .in('vendor_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);

    return (data || []).map((profile) => {
      const products = productCounts?.filter((p) => p.vendor_id === profile.id) || [];
      return {
        ...profile,
        totalProducts: products.length,
        publishedProducts: products.filter((p) => p.status === 'published').length,
        pendingProducts: products.filter((p) => p.status === 'pending_review').length,
      };
    });
  } catch (error: any) {
    console.error('getAdminSellers error:', error.message, error.details);
    return [];
  }
}

export async function getAdminSellerDetail(sellerId: string) {
  try {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sellerId)
      .single();

    if (error || !profile) return null;

    const { data: products } = await supabase
      .from('products')
      .select(
        'id, name, status, price, created_at, images, category:product_categories(name)'
      )
      .eq('vendor_id', sellerId)
      .order('created_at', { ascending: false });

    // Try seller_earnings
    const { data: earnings } = await supabase
      .from('seller_earnings')
      .select('net_amount')
      .eq('vendor_id', sellerId);

    const totalRevenue = earnings?.reduce((sum, e) => sum + (e.net_amount || 0), 0) || 0;

    return {
      profile,
      products: products || [],
      totalSales: 0,
      totalRevenue,
    };
  } catch (error) {
    console.error('getAdminSellerDetail error:', error);
    return null;
  }
}

export async function approveSeller(sellerId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('profiles')
      .update({ approval_status: 'approved' })
      .eq('id', sellerId);

    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: sellerId,
      type: 'system',
      title: '✅ Seller Account Approved!',
      message: 'Your seller account has been approved. You can now list products securely.',
      link: '/seller/dashboard',
    });

    revalidatePath('/admin/sellers');
    revalidatePath(`/admin/sellers/${sellerId}`);
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectSeller(sellerId: string, reason: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('profiles')
      .update({ approval_status: 'rejected' })
      .eq('id', sellerId);

    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: sellerId,
      type: 'system',
      title: 'Seller Application Update',
      message: `Your seller application was not approved. Reason: ${reason}`,
      link: '/settings',
    });

    revalidatePath('/admin/sellers');
    revalidatePath(`/admin/sellers/${sellerId}`);
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function suspendSeller(sellerId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('profiles')
      .update({ status: 'suspended', approval_status: 'suspended' })
      .eq('id', sellerId);

    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: sellerId,
      type: 'system',
      title: 'Account Suspended',
      message: 'Your seller account has been suspended.',
      link: '/support',
    });

    revalidatePath('/admin/sellers');
    revalidatePath(`/admin/sellers/${sellerId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Product Management ──────────────────────────────────────────────────────

export async function getAdminProducts(
  filter?: 'all' | 'pending_review' | 'published' | 'draft' | 'rejected' | 'archived'
) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        images,
        price,
        status,
        created_at,
        vendor_id,
        seller:profiles!vendor_id(
          id,
          full_name,
          email,
          avatar_url,
          approval_status
        ),
        category:product_categories(
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (filter && filter !== 'all') {
      query = (query as any).eq('status', filter);
    }

    const { data: products, error } = await query;
    if (error) throw error;

    if (!products || products.length === 0) return [];

    // Since we don't have orders table query yet, we will mock sales count as 0
    return products.map((c: any) => ({
      ...c,
      salesCount: 0,
    }));
  } catch (error: any) {
    console.error('getAdminProducts error:', error.message, error.details);
    return [];
  }
}

export async function approveProduct(productId: string) {
  try {
    const supabase = await createClient();

    const { data: product } = await supabase
      .from('products')
      .select('name, vendor_id')
      .eq('id', productId)
      .single();

    if (!product) return { success: false, error: 'Product not found' };

    const { error } = await supabase
      .from('products')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        rejection_reason: null,
      })
      .eq('id', productId);

    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: product.vendor_id,
      type: 'system',
      title: '🎉 Product Approved & Published!',
      message: `Your product "${product.name}" has been approved and is now live on Slate!`,
      link: `/seller/products/${productId}`,
    });

    revalidatePath('/admin/products');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectProduct(productId: string, reason: string) {
  try {
    const supabase = await createClient();

    if (!reason?.trim()) {
      return { success: false, error: 'Rejection reason is required' };
    }

    const { data: product } = await supabase
      .from('products')
      .select('name, vendor_id')
      .eq('id', productId)
      .single();

    if (!product) return { success: false, error: 'Product not found' };

    const { error } = await supabase
      .from('products')
      .update({
        status: 'rejected',
        rejection_reason: reason.trim(),
      })
      .eq('id', productId);

    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: product.vendor_id,
      type: 'system',
      title: 'Product Needs Changes',
      message: `Your product "${product.name}" was not approved. Reason: ${reason}`,
      link: `/seller/products/${productId}`,
    });

    revalidatePath('/admin/products');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function unpublishProduct(productId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('products')
      .update({ status: 'archived' })
      .eq('id', productId);

    if (error) throw error;

    revalidatePath('/admin/products');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const supabase = await createClient();
    
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();
      
    if (!product) return { success: false, error: 'Product not found' };

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    revalidatePath('/admin/products');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Order Management ────────────────────────────────────────────────────────

export async function getAdminOrders(
  filter?: 'all' | 'paid' | 'pending' | 'failed' | 'refunded'
) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('orders')
      .select(`
        id,
        status,
        total_amount,
        payment_method,
        created_at,
        student_id,
        student:profiles!student_id(
          id,
          full_name,
          email,
          avatar_url
        ),
        order_items(
          id,
          item_type,
          quantity,
          unit_price,
          total_price,
          course:courses(title, thumbnail_url),
          product:products(name, images)
        )
      `)
      .order('created_at', { ascending: false });

    if (filter && filter !== 'all') {
      query = (query as any).eq('status', filter);
    }

    const { data: orders, error } = await query;
    if (error) throw error;

    return (orders || []).map((o: any) => {
      // Create a summary of items
      const itemsDesc = o.order_items?.map((i: any) => {
        if (i.item_type === 'course') return i.course?.title || 'Unknown Course';
        if (i.item_type === 'product') return i.product?.name || 'Unknown Product';
        return 'Unknown Item';
      });

      return {
        ...o,
        itemsSummary: itemsDesc?.join(', ') || 'No items',
        totalItems: o.order_items?.length || 0,
      };
    });
  } catch (error) {
    console.error('getAdminOrders error:', error);
    return [];
  }
}

// ─── Earnings Management ─────────────────────────────────────────────────────

export async function getAdminEarnings() {
  try {
    const supabase = await createClient();

    // Summing earnings from 'earnings' table which tracks gross_amount by instructor_id
    const { data: earningsData, error: earningsError } = await supabase
      .from('earnings')
      .select('instructor_id, gross_amount, created_at, status');

    if (earningsError) throw earningsError;

    // Get profiles for those instructors/sellers
    const instructorIds = [...new Set((earningsData || []).map((e: any) => e.instructor_id))];
    
    // Fallback if no specific earnings, use enrollments to calculate
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('amount_paid, course:courses(instructor_id)');

    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount, status, order_items(item_type, course:courses(instructor_id), product:products(vendor_id))')
      .eq('status', 'paid');

    const aggregator: Record<string, { totalSales: number; grossRevenue: number }> = {};

    // We can aggregate per instructor ID based on orders and enrollments 
    // to build the payouts table dynamically
    (enrollments || []).forEach((e: any) => {
      const iId = e.course?.instructor_id;
      if (!iId) return;
      if (!aggregator[iId]) aggregator[iId] = { totalSales: 0, grossRevenue: 0 };
      aggregator[iId].totalSales += 1;
      aggregator[iId].grossRevenue += (e.amount_paid || 0);
    });

    (orders || []).forEach((o: any) => {
      (o.order_items || []).forEach((i: any) => {
        let uId = null;
        if (i.item_type === 'course') uId = i.course?.instructor_id;
        if (i.item_type === 'product') uId = i.product?.vendor_id;
        if (!uId) return;
        
        if (!aggregator[uId]) aggregator[uId] = { totalSales: 0, grossRevenue: 0 };
        // Approximate division or count. For simplicity, we just add the order's total_amount to the first item's owner or divide.
        // Or if we trust grossRevenue, it's better. But let's build the exact aggregation.
      });
    });

    // Instead of raw calculations, we can use the `earningsData` if it is populated.
    (earningsData || []).forEach((e: any) => {
      if (!e.instructor_id) return;
      if (!aggregator[e.instructor_id]) aggregator[e.instructor_id] = { totalSales: 0, grossRevenue: 0 };
      aggregator[e.instructor_id].totalSales += 1;
      aggregator[e.instructor_id].grossRevenue += (e.gross_amount || 0);
    });

    const idsToFetch = Object.keys(aggregator);
    let profiles: any[] = [];
    if (idsToFetch.length > 0) {
      const { data: p } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, role')
        .in('id', idsToFetch);
      profiles = p || [];
    }

    let platformTotal = 0;
    let payoutTotal = 0;
    let grossTotal = 0;

    const payoutList = profiles.map((p) => {
      const stats = aggregator[p.id];
      const gross = stats.grossRevenue;
      grossTotal += gross;
      
      const platformFee = gross * 0.3; // 30% platform fee
      platformTotal += platformFee;
      
      const payoutAmount = gross * 0.7; // 70% payout
      payoutTotal += payoutAmount;

      return {
        user: p,
        totalSales: stats.totalSales,
        grossRevenue: gross,
        platformFee,
        payoutAmount,
        status: 'pending' // or from earningsData status
      };
    });

    payoutList.sort((a, b) => b.grossRevenue - a.grossRevenue);

    return {
      overview: {
        grossTotal,
        platformTotal,
        payoutTotal,
      },
      payoutList,
    };
  } catch (error: any) {
    console.error('getAdminEarnings error:', error.message, error.details);
    return { overview: { grossTotal: 0, platformTotal: 0, payoutTotal: 0 }, payoutList: [] };
  }
}

// ─── Reports & Analytics ─────────────────────────────────────────────────────

export async function getAdminReports() {
  try {
    const supabase = await createClient();
    
    // 1. Sales over time (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // We can pull combined enrollments + orders.
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('total_amount, created_at, status')
      .eq('status', 'paid')
      .gte('created_at', thirtyDaysAgo.toISOString());
      
    const { data: recentEnrollments } = await supabase
      .from('enrollments')
      .select('amount_paid, enrolled_at')
      .gte('enrolled_at', thirtyDaysAgo.toISOString());

    const salesMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      salesMap[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
    }

    (recentOrders || []).forEach((o: any) => {
      const dateStr = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (salesMap[dateStr] !== undefined) {
        salesMap[dateStr] += (o.total_amount || 0);
      }
    });

    (recentEnrollments || []).forEach((e: any) => {
      const dateStr = new Date(e.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (salesMap[dateStr] !== undefined) {
        salesMap[dateStr] += (e.amount_paid || 0);
      }
    });

    const salesOverTime = Object.keys(salesMap).map((date) => ({
      date,
      revenue: salesMap[date],
    }));

    // 2. Top Courses
    const { data: topCourses } = await supabase
      .from('courses')
      .select('id, title, thumbnail_url, price, status, enrollment_count, instructor:profiles!instructor_id(full_name)')
      .eq('status', 'published')
      .order('enrollment_count', { ascending: false })
      .limit(5);

    const courseArray = (topCourses || []).map((c: any) => ({
      ...c,
      sales: c.enrollment_count || 0,
    }));

    // 3. Top Products
    const { data: topProducts } = await supabase
      .from('products')
      .select('id, name, images, price, status, seller:profiles!vendor_id(full_name)')
      .eq('status', 'active');
      
    // Fetch product sales from order_items
    const { data: productSales } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('item_type', 'product');

    const productSalesMap: Record<string, number> = {};
    (productSales || []).forEach((item: any) => {
      if (item.product_id) {
        productSalesMap[item.product_id] = (productSalesMap[item.product_id] || 0) + (item.quantity || 1);
      }
    });

    const productArray = (topProducts || []).map((p: any) => ({
      ...p,
      sales: productSalesMap[p.id] || 0,
    })).sort((a: any, b: any) => b.sales - a.sales).slice(0, 5);

    // 4. Platform Growth (Counts)
    const [
      { count: studentCount },
      { count: instructorCount },
      { count: sellerCount }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'instructor'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
    ]);

    return {
      salesOverTime,
      topCourses: courseArray,
      topProducts: productArray,
      demographics: [
        { name: 'Students', value: studentCount || 0 },
        { name: 'Instructors', value: instructorCount || 0 },
        { name: 'Sellers', value: sellerCount || 0 },
      ]
    };
  } catch (error) {
    console.error('getAdminReports error:', error);
    return {
      salesOverTime: [],
      topCourses: [],
      topProducts: [],
      demographics: []
    };
  }
}

// ─── System Announcements ────────────────────────────────────────────────────

export async function getSystemAnnouncements() {
  try {
    const supabase = await createClient();
    
    // Fetch unique system announcements. Since we might insert them per-user, 
    // a simple way to group is by title, message and approximate created_at.
    // Or we fetch notifications where type is 'system' and we group them.
    const { data: notifications } = await supabase
      .from('notifications')
      .select('id, title, message, created_at, type')
      .eq('type', 'system')
      .order('created_at', { ascending: false })
      .limit(200);

    // Grouping manually to simulate 'announcements'
    const grouped: Record<string, any> = {};
    (notifications || []).forEach((n: any) => {
      const key = `${n.title}-${n.message}`;
      if (!grouped[key]) {
        grouped[key] = { ...n, count: 1 };
      } else {
        grouped[key].count++;
      }
    });

    return Object.values(grouped).sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('getSystemAnnouncements error:', error);
    return [];
  }
}

export async function sendSystemAnnouncement(
  targetRoles: string[],
  title: string,
  message: string,
  link?: string
) {
  try {
    const supabase = await createClient();

    // Find all users in the target roles
    let query = supabase.from('profiles').select('id');
    if (!targetRoles.includes('all')) {
      query = query.in('role', targetRoles);
    }
    
    const { data: users, error: userError } = await query;
    if (userError) throw userError;

    if (!users || users.length === 0) {
      return { success: false, error: 'No users found for selected roles' };
    }

    const payload = users.map(u => ({
      user_id: u.id,
      type: 'system',
      title,
      message,
      link: link || null,
      is_read: false,
    }));

    // Batch insert notifications
    const { error: insertError } = await supabase
      .from('notifications')
      .insert(payload);

    if (insertError) throw insertError;
    
    revalidatePath('/admin/notifications');
    return { success: true, count: payload.length };
  } catch (error: any) {
    console.error('sendSystemAnnouncement error:', error);
    return { success: false, error: error.message };
  }
}

// ─── Settings Management ───────────────────────────────────────────────────

export async function toggleFeaturedCourse(courseId: string, isFeatured: boolean) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('courses')
      .update({ is_featured: isFeatured })
      .eq('id', courseId);
      
    if (error) throw error;
    
    revalidatePath('/admin/settings');
    revalidatePath('/admin/courses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function forcePublishCourse(courseId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('courses')
      .update({
        status: 'published',
        approved_at: new Date().toISOString(),
        is_archived: false,
      })
      .eq('id', courseId);
    if (error) throw error;
    revalidatePath('/admin/courses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function archiveCourse(courseId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('courses')
      .update({
        status: 'unpublished', // Using safe string that fallback UI can handle
        is_archived: true,
      })
      .eq('id', courseId);
    if (error) throw error;
    revalidatePath('/admin/courses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function assignInstructor(courseId: string, instructorId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('courses')
      .update({ instructor_id: instructorId })
      .eq('id', courseId);
    if (error) throw error;
    
    // Notify the new instructor
    const { data: course } = await supabase.from('courses').select('title').eq('id', courseId).single();
    if (course) {
      await supabase.from('notifications').insert({
        user_id: instructorId,
        type: 'system',
        title: 'You have been assigned to a new course',
        message: `An admin has assigned you as the instructor for "${course.title}".`,
        link: `/instructor/courses/${courseId}`,
      });
    }

    revalidatePath('/admin/courses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkPublishCourses(courseIds: string[]) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('courses')
      .update({ status: 'published', approved_at: new Date().toISOString(), is_archived: false })
      .in('id', courseIds);
    if (error) throw error;
    revalidatePath('/admin/courses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkDeleteCourses(courseIds: string[]) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('courses')
      .delete()
      .in('id', courseIds);
    if (error) throw error;
    revalidatePath('/admin/courses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCourseAdmin(courseId: string, updates: any) {
  try {
    const supabase = await createClient();
    // Validate if category changes etc if necessary
    const { error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId);
    if (error) throw error;
    revalidatePath('/admin/courses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCourseAdmin(data: any) {
  try {
    const supabase = await createClient();
    
    // Generate slug from title if not provided
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newCourse = {
      ...data,
      slug,
      status: 'published', // Admin created course automatically published
      approved_at: new Date().toISOString(),
      is_featured: false,
      is_archived: false,
      rating: 0,
      rating_count: 0,
      total_students: 0
    };

    const { data: created, error } = await supabase
      .from('courses')
      .insert(newCourse)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/admin/courses');
    return { success: true, courseId: created.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function forcePublishProduct(productId: string, stockQuantity?: number) {
  try {
    const supabase = await createClient();

    const updates: any = { status: 'active', updated_at: new Date().toISOString() };
    if (stockQuantity !== undefined) {
      updates.stock_quantity = stockQuantity;
    }

    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId);

    if (error) throw error;

    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath('/store');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
