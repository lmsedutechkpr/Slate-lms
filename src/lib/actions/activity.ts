'use server';

import { createClient } from '@/lib/supabase/server';
import { UserActivityLog } from '@/types';

export async function getRecentActivity(limit = 10): Promise<UserActivityLog[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_activity_log')
    .select('*, course:courses(title, slug, thumbnail_url), lecture:lectures(title)')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activity:', error);
    return [];
  }

  return (data || []) as UserActivityLog[];
}

export async function logActivity(
  activityType: UserActivityLog['activity_type'],
  opts?: { courseId?: string; lectureId?: string; metadata?: Record<string, any> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('user_activity_log').insert({
    student_id: user.id,
    activity_type: activityType,
    course_id: opts?.courseId ?? null,
    lecture_id: opts?.lectureId ?? null,
    product_id: null,
    metadata: opts?.metadata ?? null,
  });
}
