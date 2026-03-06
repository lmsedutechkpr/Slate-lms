import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getNotifications, getNotificationStats } from '@/lib/actions/notifications';
import { NotificationPageClient } from '@/components/notifications/NotificationPageClient';

interface PageProps {
  searchParams: Promise<{ filter?: 'all' | 'unread' | 'read' }>;
}

export default async function NotificationsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { filter } = await searchParams;
  const notifications = await getNotifications(user.id, filter);
  const stats = await getNotificationStats(user.id);

  return (
    <NotificationPageClient
      initialNotifications={notifications}
      userId={user.id}
      stats={stats}
    />
  );
}
