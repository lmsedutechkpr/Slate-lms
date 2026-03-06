import { getAdminInstructors } from '@/lib/actions/admin';
import AdminInstructorsClient from './AdminInstructorsClient';

export default async function AdminInstructorsPage() {
  const allInstructors = await getAdminInstructors();
  return <AdminInstructorsClient initialInstructors={allInstructors} />;
}
