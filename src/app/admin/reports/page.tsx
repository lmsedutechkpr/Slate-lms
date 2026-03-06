import { getAdminReports } from '@/lib/actions/admin';
import AdminReportsClient from './AdminReportsClient';

export default async function AdminReportsPage() {
  const data = await getAdminReports();
  
  return <AdminReportsClient initialData={data} />;
}
