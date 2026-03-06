import { getAdminEarnings } from '@/lib/actions/admin';
import AdminEarningsClient from './AdminEarningsClient';

export default async function AdminEarningsPage() {
  const earningsData = await getAdminEarnings();
  
  return <AdminEarningsClient initialData={earningsData} />;
}
