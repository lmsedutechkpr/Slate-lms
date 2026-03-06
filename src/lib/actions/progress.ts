'use server';

import { createClient } from '@/lib/supabase/server';
import { Enrollment, Certificate, QuizAttempt } from '@/types';

// ── helpers ─────────────────────────────────────────────────────────────────

function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function computeStreaks(dates: Date[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };

  // Deduplicate by UTC day string
  const daySet = new Set(dates.map((d) => startOfDayUTC(d).toISOString()));
  const days = Array.from(daySet)
    .map((s) => new Date(s))
    .sort((a, b) => b.getTime() - a.getTime()); // desc

  const todayStr = startOfDayUTC(new Date()).toISOString();
  const yesterdayStr = startOfDayUTC(
    new Date(Date.now() - 86_400_000)
  ).toISOString();

  const mostRecentStr = days[0].toISOString();
  const isActive =
    mostRecentStr === todayStr || mostRecentStr === yesterdayStr;

  let current = 0;
  let longest = 1;
  let run = 1;

  for (let i = 0; i < days.length - 1; i++) {
    const diff =
      (days[i].getTime() - days[i + 1].getTime()) / (1000 * 60 * 60 * 24);
    if (Math.round(diff) === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }
  if (run > longest) longest = run;

  if (isActive) {
    // count run from most recent backward
    let streak = 1;
    for (let i = 0; i < days.length - 1; i++) {
      const diff =
        (days[i].getTime() - days[i + 1].getTime()) / (1000 * 60 * 60 * 24);
      if (Math.round(diff) === 1) {
        streak++;
      } else {
        break;
      }
    }
    current = streak;
  }

  return { current, longest };
}

// ── getProgressOverview ──────────────────────────────────────────────────────

export async function getProgressOverview(studentId: string) {
  try {
    const supabase = await createClient();

    const [
      enrolledResult,
      completedResult,
      watchTimeResult,
      certResult,
      quizResult,
      activityResult,
    ] = await Promise.all([
      supabase
        .from('enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId),

      supabase
        .from('enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .not('completed_at', 'is', null),

      supabase
        .from('lecture_progress')
        .select('watch_time_seconds')
        .eq('student_id', studentId),

      supabase
        .from('certificates')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId),

      supabase
        .from('quiz_attempts')
        .select('percentage, passed')
        .eq('student_id', studentId)
        .not('completed_at', 'is', null),

      supabase
        .from('user_activity_log')
        .select('created_at')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false }),
    ]);

    const totalEnrolled = enrolledResult.count ?? 0;
    const totalCompleted = completedResult.count ?? 0;
    const totalInProgress = totalEnrolled - totalCompleted;

    const totalWatchSeconds = (watchTimeResult.data ?? []).reduce(
      (acc, lp) => acc + (lp.watch_time_seconds ?? 0),
      0
    );
    const totalWatchMinutes = Math.round(totalWatchSeconds / 60);
    const totalWatchHours = totalWatchMinutes / 60;

    const certificateCount = certResult.count ?? 0;

    const quizData = quizResult.data ?? [];
    const totalQuizzesTaken = quizData.length;
    const avgQuizScore =
      totalQuizzesTaken > 0
        ? quizData.reduce((a, b) => a + (b.percentage ?? 0), 0) /
          totalQuizzesTaken
        : 0;

    const activityDates = (activityResult.data ?? []).map(
      (a) => new Date(a.created_at)
    );
    const { current: currentStreak, longest: longestStreak } =
      computeStreaks(activityDates);

    return {
      totalEnrolled,
      totalCompleted,
      totalInProgress,
      totalWatchMinutes,
      totalWatchHours,
      certificateCount,
      currentStreak,
      longestStreak,
      totalQuizzesTaken,
      avgQuizScore,
    };
  } catch (err) {
    console.error('getProgressOverview error:', err);
    return {
      totalEnrolled: 0,
      totalCompleted: 0,
      totalInProgress: 0,
      totalWatchMinutes: 0,
      totalWatchHours: 0,
      certificateCount: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalQuizzesTaken: 0,
      avgQuizScore: 0,
    };
  }
}

// ── getCourseProgress ────────────────────────────────────────────────────────

export async function getCourseProgress(studentId: string): Promise<
  Array<{
    enrollment: Enrollment;
    completedLectures: number;
    totalLectures: number;
    quizAttempts: QuizAttempt[];
    certificate: Certificate | null;
  }>
> {
  try {
    const supabase = await createClient();

    const [enrollmentsResult, lpResult, quizResult, certResult] =
      await Promise.all([
          supabase
            .from('enrollments')
            .select(
              `*, course:courses (
                id, title, title_ta, slug,
                thumbnail_url, total_lectures,
                duration_minutes,
                category:categories (id, name, name_ta, slug, color)
              )`
            )
            .eq('student_id', studentId)
            .order('last_accessed_at', { ascending: false, nullsFirst: false }),

        supabase
          .from('lecture_progress')
          .select('course_id')
          .eq('student_id', studentId)
          .eq('is_completed', true),

        supabase
          .from('quiz_attempts')
          .select('*')
          .eq('student_id', studentId)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false }),

        supabase
          .from('certificates')
          .select('*')
          .eq('student_id', studentId),
      ]);

    const enrollments = (enrollmentsResult.data ?? []) as Enrollment[];

    // Build completed lecture map
    const completedMap: Record<string, number> = {};
    for (const lp of lpResult.data ?? []) {
      completedMap[lp.course_id] = (completedMap[lp.course_id] ?? 0) + 1;
    }

    // Build quiz map
    const quizMap: Record<string, QuizAttempt[]> = {};
    for (const qa of (quizResult.data ?? []) as QuizAttempt[]) {
      if (!quizMap[qa.course_id]) quizMap[qa.course_id] = [];
      quizMap[qa.course_id].push(qa);
    }

    // Build cert map
    const certMap: Record<string, Certificate> = {};
    for (const c of (certResult.data ?? []) as Certificate[]) {
      certMap[c.course_id] = c;
    }

    return enrollments.map((enrollment) => ({
      enrollment,
      completedLectures: completedMap[enrollment.course_id] ?? 0,
      totalLectures: enrollment.course?.total_lectures ?? 0,
      quizAttempts: quizMap[enrollment.course_id] ?? [],
      certificate: certMap[enrollment.course_id] ?? null,
    }));
  } catch (err) {
    console.error('getCourseProgress error:', err);
    return [];
  }
}

// ── getWeeklyActivity ────────────────────────────────────────────────────────

export async function getWeeklyActivity(studentId: string): Promise<
  Array<{
    date: string;
    lecturesCompleted: number;
    minutesWatched: number;
  }>
> {
  try {
    const supabase = await createClient();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const { data } = await supabase
      .from('lecture_progress')
      .select('completed_at, watch_time_seconds')
      .eq('student_id', studentId)
      .eq('is_completed', true)
      .gte('completed_at', sevenDaysAgo.toISOString())
      .not('completed_at', 'is', null);

    // Build map keyed by YYYY-MM-DD (UTC)
    const map: Record<string, { lectures: number; seconds: number }> = {};
    for (const lp of data ?? []) {
      if (!lp.completed_at) continue;
      const d = new Date(lp.completed_at);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      if (!map[key]) map[key] = { lectures: 0, seconds: 0 };
      map[key].lectures += 1;
      map[key].seconds += lp.watch_time_seconds ?? 0;
    }

    // Build 7-day array from today-6 to today
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      const entry = map[key];
      result.push({
        date: key,
        lecturesCompleted: entry?.lectures ?? 0,
        minutesWatched: entry ? Math.round(entry.seconds / 60) : 0,
      });
    }

    return result;
  } catch {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
      return {
        date: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`,
        lecturesCompleted: 0,
        minutesWatched: 0,
      };
    });
  }
}

// ── getQuizHistory ───────────────────────────────────────────────────────────

export async function getQuizHistory(studentId: string): Promise<
  Array<{
    attempt: QuizAttempt;
    courseName: string | null;
    quizTitle: string | null;
  }>
> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(
        `*, course:courses ( title, title_ta, slug ), quiz:quizzes ( title, title_ta )`
      )
      .eq('student_id', studentId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(20);

    if (error) return [];

    return (data ?? []).map((row: any) => ({
      attempt: row as QuizAttempt,
      courseName: row.course?.title ?? null,
      quizTitle: row.quiz?.title ?? null,
    }));
  } catch {
    return [];
  }
}

// ── getCertificates ──────────────────────────────────────────────────────────

export async function getCertificates(studentId: string): Promise<
  Array<{
    certificate: Certificate;
    course: any | null;
  }>
> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('certificates')
      .select(
        `*, course:courses (
          id, title, title_ta, slug,
          thumbnail_url,
          category:categories (name, color)
        )`
      )
      .eq('student_id', studentId)
      .order('issued_at', { ascending: false });

    if (error) return [];

    return (data ?? []).map((row: any) => ({
      certificate: row as Certificate,
      course: row.course ?? null,
    }));
  } catch {
    return [];
  }
}
