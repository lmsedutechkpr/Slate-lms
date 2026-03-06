import { getAdminProducts } from '@/lib/actions/admin';
import AdminProductsClient from './AdminProductsClient';

export default async function AdminProductsPage() {
  const products = await getAdminProducts('all');

  return <AdminProductsClient initialProducts={products} />;
}
