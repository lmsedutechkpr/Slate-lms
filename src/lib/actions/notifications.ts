'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Notification } from '@/types';

export async function getNotifications(
  userId: string,
  filter?: 'all' | 'unread' | 'read'
): Promise<Notification[]> {
  const supabase = await createClient();
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (filter === 'unread') query = query.eq('is_read', false);
  if (filter === 'read') query = query.eq('is_read', true);

  const { data } = await query;
  return (data ?? []) as Notification[];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  return count ?? 0;
}

export async function getNotificationStats(userId: string): Promise<{
  total: number;
  unread: number;
  byType: Record<string, number>;
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId);

  const stats = {
    total: data?.length ?? 0,
    unread: data?.filter((n) => !n.is_read).length ?? 0,
    byType: {} as Record<string, number>,
  };

  data?.forEach((n) => {
    stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
  });

  return stats;
}

export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/notifications');
}

export async function markAllAsRead(userId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/notifications');
}

export async function deleteNotification(
  id: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from('notifications')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/notifications');
}

export async function deleteAllRead(userId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId)
    .eq('is_read', true);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/notifications');
}
