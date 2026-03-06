import { createClient } from '@/lib/supabase/server';
import { getInstructorCourseDetails } from '@/lib/actions/instructor';
import { getCategories } from '@/lib/actions/courses';
import { notFound, redirect } from 'next/navigation';
import CourseEditForm from '@/components/instructor/CourseEditForm';

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id: courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const [details, categories] = await Promise.all([
    getInstructorCourseDetails(courseId, user.id),
    getCategories()
  ]);

  if (!details) {
    return notFound();
  }

  return (
    <CourseEditForm 
      course={details.course} 
      categories={categories} 
      instructorId={user.id} 
    />
  );
}
