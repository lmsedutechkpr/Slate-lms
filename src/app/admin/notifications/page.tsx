import { getSystemAnnouncements } from '@/lib/actions/admin';
import AdminNotificationsClient from './AdminNotificationsClient';

export default async function AdminNotificationsPage() {
  const announcements = await getSystemAnnouncements();
  
  return <AdminNotificationsClient initialAnnouncements={announcements} />;
}
