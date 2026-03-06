import { getAdminCourses } from '@/lib/actions/admin';
import AdminSettingsClient from './AdminSettingsClient';

export default async function AdminSettingsPage() {
  const courses = await getAdminCourses('all'); // Fetch all courses, we will filter for published in UI

  return <AdminSettingsClient courses={courses} />;
}
