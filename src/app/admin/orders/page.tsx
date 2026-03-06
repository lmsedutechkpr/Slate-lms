import { getAdminOrders } from '@/lib/actions/admin';
import AdminOrdersClient from './AdminOrdersClient';

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders('all');
  
  return <AdminOrdersClient initialOrders={orders} />;
}
