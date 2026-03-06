import { createClient } from '@/lib/supabase/server';
import { getInstructorCourses } from '@/lib/actions/instructor';
import InstructorCoursesClient from '@/components/instructor/InstructorCoursesClient';

export default async function InstructorCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const allCourses = await getInstructorCourses(user.id);

  const activeStatus = status || 'all';

  const filteredCourses =
    activeStatus === 'all'
      ? allCourses
      : allCourses.filter((c) => c.status === activeStatus);

  const counts = {
    all: allCourses.length,
    published: allCourses.filter((c) => c.status === 'published').length,
    draft: allCourses.filter((c) => c.status === 'draft').length,
    pending: allCourses.filter((c) => c.status === 'pending_review').length,
    rejected: allCourses.filter((c) => c.status === 'rejected').length,
  };

  return (
    <InstructorCoursesClient
      courses={filteredCourses}
      activeStatus={activeStatus}
      counts={counts}
    />
  );
}
