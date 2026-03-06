import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { CoursePlayer } from '@/components/learn/CoursePlayer';
import { Course, CourseSection, LectureProgress } from '@/types';

async function getLearnData(slug: string, userId: string) {
  const supabase = await createClient();

  // Get course
  const { data: courseData } = await supabase
    .from('courses')
    .select('*, instructor:profiles(id, full_name, avatar_url), category:categories(id, name, slug)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!courseData) return null;

  const course = courseData as Course;

  // Check enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*')
    .eq('student_id', userId)
    .eq('course_id', course.id)
    .maybeSingle();

  if (!enrollment) return null; // Must be enrolled

  // Get sections + lectures
  const { data: sectionsData } = await supabase
    .from('course_sections')
    .select(`*, lectures(*)`)
    .eq('course_id', course.id)
    .order('order_index');

  const sections = (sectionsData ?? []) as CourseSection[];
  sections.forEach((s) => {
    if (s.lectures) {
      s.lectures.sort((a, b) => a.order_index - b.order_index);
    }
  });

  // Get lecture progress
  const { data: progressData } = await supabase
    .from('lecture_progress')
    .select('*')
    .eq('student_id', userId)
    .eq('course_id', course.id);

  const lectureProgress = (progressData ?? []) as LectureProgress[];
  const progressMap: Record<string, LectureProgress> = {};
  for (const p of lectureProgress) {
    progressMap[p.lecture_id] = p;
  }

  return { course, sections, enrollment, progressMap };
}

export default async function LearnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const data = await getLearnData(slug, user.id);

  if (!data) {
    // Either course doesn't exist or not enrolled
    redirect(`/courses/${slug}`);
  }

  const { course, sections, enrollment, progressMap } = data;

  return (
    <CoursePlayer
      course={course}
      sections={sections}
      enrollment={enrollment}
      progressMap={progressMap}
      userId={user.id}
    />
  );
}
