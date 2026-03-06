'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Enrollment, Certificate } from '@/types';

export type MyCoursesFilter = 'all' | 'in-progress' | 'completed';
export type MyCoursesSortOption = 'recent' | 'progress' | 'enrolled' | 'title';

export interface GetMyEnrollmentsParams {
  studentId: string;
  filter: MyCoursesFilter;
  search: string;
  sort: MyCoursesSortOption;
  page: number;
  limit: number;
}

export interface GetMyEnrollmentsResult {
  enrollments: Enrollment[];
  total: number;
  totalPages: number;
}

export async function getMyEnrollments(
  params: GetMyEnrollmentsParams
): Promise<GetMyEnrollmentsResult> {
  const { studentId, filter, search, sort, page, limit } = params;

  try {
    const supabase = await createClient();

    let query = supabase
      .from('enrollments')
      .select(
        `*,
        course:courses (
          id, title, title_ta, slug, thumbnail_url,
          duration_minutes, total_lectures, price,
          difficulty, language, rating, rating_count,
          category:categories (
            id, name, name_ta, slug, icon, color
          ),
          instructor:profiles (
            id, full_name, avatar_url
          )
        )`
      )
      .eq('student_id', studentId);

    // Apply filter
    if (filter === 'in-progress') {
      query = query.gt('progress_percent', 0).is('completed_at', null);
    } else if (filter === 'completed') {
      query = query.not('completed_at', 'is', null);
    }

    // Apply sort (server-side where possible)
    if (sort === 'recent') {
      query = query.order('last_accessed_at', { ascending: false, nullsFirst: false });
    } else if (sort === 'progress') {
      query = query.order('progress_percent', { ascending: false });
    } else if (sort === 'enrolled') {
      query = query.order('enrolled_at', { ascending: false });
    }
    // 'title' sort done client-side after fetch

    const { data, error } = await query;

    if (error) throw error;

    let enrollments: Enrollment[] = (data || []) as Enrollment[];

    // Client-side search filter
    if (search.trim().length > 0) {
      const lower = search.toLowerCase();
      enrollments = enrollments.filter((e) =>
        e.course?.title?.toLowerCase().includes(lower)
      );
    }

    // Client-side title sort
    if (sort === 'title') {
      enrollments = enrollments.sort((a, b) =>
        (a.course?.title ?? '').localeCompare(b.course?.title ?? '')
      );
    }

    const total = enrollments.length;
    const totalPages = Math.ceil(total / limit);

    // Client-side pagination
    const start = (page - 1) * limit;
    const paginated = enrollments.slice(start, start + limit);

    return { enrollments: paginated, total, totalPages };
  } catch {
    return { enrollments: [], total: 0, totalPages: 0 };
  }
}

export interface EnrollmentCounts {
  all: number;
  inProgress: number;
  completed: number;
}

export async function getEnrollmentCounts(
  studentId: string
): Promise<EnrollmentCounts> {
  try {
    const supabase = await createClient();

    const [allResult, inProgressResult, completedResult] = await Promise.all([
      supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId),
      supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .gt('progress_percent', 0)
        .is('completed_at', null),
      supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .not('completed_at', 'is', null),
    ]);

    return {
      all: allResult.count ?? 0,
      inProgress: inProgressResult.count ?? 0,
      completed: completedResult.count ?? 0,
    };
  } catch {
    return { all: 0, inProgress: 0, completed: 0 };
  }
}

export async function getStudentCertificates(
  studentId: string
): Promise<Record<string, Certificate>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('student_id', studentId);

    if (error) throw error;

    const map: Record<string, Certificate> = {};
    for (const cert of data ?? []) {
      map[cert.course_id] = cert as Certificate;
    }
    return map;
  } catch {
    return {};
  }
}

export async function getCertificateById(
  id: string,
  studentId: string
): Promise<(Certificate & { course?: { title: string; thumbnail_url: string | null }; student?: { full_name: string | null } }) | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('certificates')
      .select(
        `*, course:courses (title, thumbnail_url), student:profiles (full_name)`
      )
      .eq('id', id)
      .eq('student_id', studentId)
      .single();

    if (error) return null;
    return data as any;
  } catch {
    return null;
  }
}
