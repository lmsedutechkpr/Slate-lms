'use server';

import { createClient } from '@/lib/supabase/server';
import { Course, Category, CourseSection, ReviewStats } from '@/types';
import type { CourseReview } from '@/types';

// ─── getCourses ──────────────────────────────────────────────────────────────

export interface GetCoursesParams {
  search?: string;
  category?: string;      // category slug or 'all'
  difficulty?: string[];
  language?: string[];
  price?: string;         // 'all' | 'free' | 'paid'
  minRating?: number;
  maxDuration?: string;   // 'any' | '2h' | '10h' | '10h+'
  sort?: string;
  page?: number;
  limit?: number;
}

export async function getCourses(params: GetCoursesParams = {}): Promise<{
  courses: Course[];
  total: number;
  totalPages: number;
}> {
  try {
    const supabase = await createClient();
    const limit = params.limit ?? 12;
    const page = params.page ?? 1;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Resolve category slug → id if needed
    let categoryId: string | null = null;
    if (params.category && params.category !== 'all') {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', params.category)
        .single();
      categoryId = cat?.id ?? null;
      if (!categoryId) {
        return { courses: [], total: 0, totalPages: 0 };
      }
    }

    let query = supabase
      .from('courses')
      .select(
        `*, category:categories(id, name, name_ta, slug, icon, color), instructor:profiles(id, full_name, avatar_url, bio)`,
        { count: 'exact' }
      )
      .eq('status', 'published');

    // SEARCH
    if (params.search && params.search.length > 1) {
      query = query.or(
        `title.ilike.%${params.search}%,description.ilike.%${params.search}%`
      );
    }

    // CATEGORY
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // DIFFICULTY
    if (params.difficulty && params.difficulty.length > 0) {
      query = query.in('difficulty', params.difficulty);
    }

    // LANGUAGE
    if (params.language && params.language.length > 0) {
      query = query.in('language', params.language);
    }

    // PRICE
    if (params.price === 'free') {
      query = query.eq('price', 0);
    } else if (params.price === 'paid') {
      query = query.gt('price', 0);
    }

    // RATING
    if (params.minRating && params.minRating > 0) {
      query = query.gte('rating', params.minRating);
    }

    // DURATION
    if (params.maxDuration === '2h') {
      query = query.lte('duration_minutes', 120);
    } else if (params.maxDuration === '10h') {
      query = query.lte('duration_minutes', 600);
    } else if (params.maxDuration === '10h+') {
      query = query.gte('duration_minutes', 600);
    }

    // SORT
    switch (params.sort) {
      case 'popular':
        query = query.order('enrollment_count', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
        break;
      default:
        query = query.order('enrollment_count', { ascending: false });
    }

    const { data, count, error } = await query.range(from, to);

    if (error) {
      console.error('getCourses error:', error);
      return { courses: [], total: 0, totalPages: 0 };
    }

    const total = count ?? 0;
    return {
      courses: (data ?? []) as Course[],
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    console.error('getCourses unexpected error:', err);
    return { courses: [], total: 0, totalPages: 0 };
  }
}

// ─── getCourseBySlug ─────────────────────────────────────────────────────────

export async function getCourseBySlug(
  slug: string,
  studentId?: string
): Promise<{
  course: Course | null;
  sections: CourseSection[];
  isEnrolled: boolean;
  isWishlisted: boolean;
  reviewStats: ReviewStats;
  reviews: CourseReview[];
}> {
  const empty = {
    course: null,
    sections: [],
    isEnrolled: false,
    isWishlisted: false,
    reviewStats: { average: 0, total: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
    reviews: [],
  };

  try {
    const supabase = await createClient();

    // 1. Fetch course
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select(
        `*, category:categories(*), instructor:profiles(id, full_name, avatar_url, bio)`
      )
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (courseError || !courseData) return empty;

    const course = courseData as Course;
    const courseId = course.id;

    // 2–6: parallel queries
    const [sectionsResult, enrollResult, wishlistResult, reviewsResult, reviewRatingsResult] =
      await Promise.all([
        // 2. Sections + lectures
        supabase
          .from('course_sections')
          .select(`*, lectures(id, title, title_ta, duration_minutes, order_index, is_free_preview, section_id)`)
          .eq('course_id', courseId)
          .order('order_index'),

        // 3. Enrollment check
        studentId
          ? supabase
              .from('enrollments')
              .select('id')
              .eq('student_id', studentId)
              .eq('course_id', courseId)
              .maybeSingle()
          : Promise.resolve({ data: null }),

        // 4. Wishlist check
        studentId
          ? supabase
              .from('wishlist')
              .select('id')
              .eq('student_id', studentId)
              .eq('course_id', courseId)
              .maybeSingle()
          : Promise.resolve({ data: null }),

        // 5. Reviews (with student profile)
        supabase
          .from('course_reviews')
          .select(`*, student:profiles(id, full_name, avatar_url)`)
          .eq('course_id', courseId)
          .order('created_at', { ascending: false })
          .limit(10),

        // 6. All ratings for stats
        supabase
          .from('course_reviews')
          .select('rating')
          .eq('course_id', courseId),
      ]);

    // Sort sections & lectures
    const sections = (sectionsResult.data ?? []) as CourseSection[];
    sections.forEach((s) => {
      if (s.lectures) {
        s.lectures.sort((a, b) => a.order_index - b.order_index);
      }
    });

    // Review stats
    const allRatings = (reviewRatingsResult.data ?? []) as { rating: number }[];
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as ReviewStats['breakdown'];
    let ratingSum = 0;
    allRatings.forEach((r) => {
      const key = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      breakdown[key] = (breakdown[key] ?? 0) + 1;
      ratingSum += r.rating;
    });
    const total = allRatings.length;
    const average = total > 0 ? ratingSum / total : 0;

    return {
      course,
      sections,
      isEnrolled: !!(enrollResult as any)?.data,
      isWishlisted: !!(wishlistResult as any)?.data,
      reviewStats: { average, total, breakdown },
      reviews: (reviewsResult.data ?? []) as CourseReview[],
    };
  } catch (err) {
    console.error('getCourseBySlug error:', err);
    return empty;
  }
}

// ─── getCategories ───────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name', { ascending: true });

    if (error) {
      console.error('getCategories error:', error);
      return [];
    }
    return (data ?? []) as Category[];
  } catch (err) {
    console.error('getCategories unexpected error:', err);
    return [];
  }
}

// ─── getCategoryCourseCounts ─────────────────────────────────────────────────

export async function getCategoryCourseCounts(): Promise<Record<string, number>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('courses')
      .select('category_id')
      .eq('status', 'published');

    if (error) {
      console.error('getCategoryCourseCounts error:', error);
      return {};
    }

    const counts: Record<string, number> = {};
    (data ?? []).forEach((c: { category_id: string | null }) => {
      if (c.category_id) {
        counts[c.category_id] = (counts[c.category_id] ?? 0) + 1;
      }
    });
    return counts;
  } catch (err) {
    console.error('getCategoryCourseCounts unexpected error:', err);
    return {};
  }
}

// ─── getStudentEnrolledCourseIds ─────────────────────────────────────────────

export async function getStudentEnrolledCourseIds(studentId: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', studentId);

    if (error) return [];
    return (data ?? []).map((e: { course_id: string }) => e.course_id);
  } catch {
    return [];
  }
}

// ─── getStudentWishlistedCourseIds ───────────────────────────────────────────

export async function getStudentWishlistedCourseIds(studentId: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('wishlist')
      .select('course_id')
      .eq('student_id', studentId);

    if (error) return [];
    return (data ?? []).map((w: { course_id: string }) => w.course_id);
  } catch {
    return [];
  }
}

// ─── Keep existing helpers ───────────────────────────────────────────────────

export async function getFeaturedCourses(): Promise<Course[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('courses')
      .select('*, category:categories(*), instructor:profiles(*)')
      .eq('is_featured', true)
      .eq('status', 'published')
      .order('enrollment_count', { ascending: false })
      .limit(6);

    if (error) return [];
    return (data ?? []) as Course[];
  } catch {
    return [];
  }
}

export async function getRecommendedCourses(
  interests: string[],
  excludeIds: string[] = []
): Promise<Course[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('courses')
      .select('*, category:categories(*), instructor:profiles(*)')
      .eq('status', 'published');

    if (interests.length > 0) {
      const { data: cats } = await supabase
        .from('categories')
        .select('id')
        .in('slug', interests);
      if (cats && cats.length > 0) {
        query = query.in('category_id', cats.map((c) => c.id));
      }
    }

    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data, error } = await query.order('rating', { ascending: false }).limit(4);
    if (error) return [];
    return (data ?? []) as Course[];
  } catch {
    return [];
  }
}
