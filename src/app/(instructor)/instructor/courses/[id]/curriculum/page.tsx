import { createClient } from '@/lib/supabase/server';
import { getInstructorCourseDetails, getInstructorCourse } from '@/lib/actions/instructor';
import { notFound, redirect } from 'next/navigation';
import CurriculumBuilder from '@/components/instructor/CurriculumBuilder';

interface CurriculumPageProps {
  params: Promise<{ id: string }>;
}

export default async function CurriculumPage({ params }: CurriculumPageProps) {
  const { id: courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const [details, fullCourse] = await Promise.all([
    getInstructorCourseDetails(courseId, user.id),
    getInstructorCourse(courseId, user.id)
  ]);

  if (!details || !fullCourse) {
    return notFound();
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <CurriculumBuilder
        courseId={courseId}
        instructorId={user.id}
        initialSections={fullCourse.sections || []}
        course={details.course}
        checklist={details.checklist}
      />
    </div>
  );
}
