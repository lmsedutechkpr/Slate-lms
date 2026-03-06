import { getAdminCourses } from '@/lib/actions/admin';
import AdminCoursesClient from './AdminCoursesClient';

export default async function AdminCoursesPage() {
  const courses = await getAdminCourses('all');

  return <AdminCoursesClient initialCourses={courses} />;
}
