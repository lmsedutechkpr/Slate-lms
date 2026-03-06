import { getAdminSellers } from '@/lib/actions/admin';
import AdminSellersClient from './AdminSellersClient';

export default async function AdminSellersPage() {
  const allSellers = await getAdminSellers();
  return <AdminSellersClient initialSellers={allSellers} />;
}
