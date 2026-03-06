'use server';

import { createClient } from '@/lib/supabase/server';
import { DashboardStats, Enrollment, Course, Certificate } from '@/types';

export async function getDashboardData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Enrollments with course data
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, course:courses(*, category:categories(*), instructor:profiles(full_name, avatar_url, id, email, role, approval_status, preferred_language, interests, bio, is_onboarded, created_at, updated_at))')
    .eq('student_id', user.id)
    .order('last_accessed_at', { ascending: false, nullsFirst: false });

  const safeEnrollments: Enrollment[] = (enrollments || []) as Enrollment[];

  // Certificates
  const { data: certificates } = await supabase
    .from('certificates')
    .select('*, course:courses(title, slug, thumbnail_url)')
    .eq('student_id', user.id);

  const safeCerts: Certificate[] = (certificates || []) as Certificate[];

  // Compute stats
  const enrolled = safeEnrollments.length;
  const completed = safeEnrollments.filter((e) => e.progress_percent === 100).length;
  const inProgress = safeEnrollments.filter((e) => e.progress_percent > 0 && e.progress_percent < 100).length;
  const totalMinutes = safeEnrollments.reduce(
    (acc, e) => acc + (e.course?.duration_minutes || 0) * (e.progress_percent / 100),
    0
  );
  const hoursLearned = Math.round(totalMinutes / 60);
  const certCount = safeCerts.length;

  const stats: DashboardStats = {
    enrolled,
    completed,
    inProgress,
    hoursLearned,
    certificates: certCount,
    currentStreak: 0, // placeholder — streak tracking requires activity log queries
  };

  // Most recently accessed enrollment for "Continue Learning"
  const latestEnrollment = safeEnrollments.length > 0 ? safeEnrollments[0] : null;

  // In-progress enrollments (exclude completed and not-started)
  const inProgressEnrollments = safeEnrollments
    .filter((e) => e.progress_percent > 0 && e.progress_percent < 100)
    .slice(0, 4);

  return {
    stats,
    latestEnrollment,
    enrollments: safeEnrollments,
    inProgressEnrollments,
    enrolledCourseIds: safeEnrollments.map((e) => e.course_id),
    certificates: safeCerts,
  };
}
