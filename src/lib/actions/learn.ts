'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/actions/activity';

export async function markLectureComplete(
  lectureId: string,
  courseId: string
): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false };

    // Upsert lecture_progress
    const { error: upsertError } = await supabase
      .from('lecture_progress')
      .upsert(
        {
          student_id: user.id,
          lecture_id: lectureId,
          course_id: courseId,
          is_completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'student_id,lecture_id' }
      );

    if (upsertError) {
      console.error('markLectureComplete upsert error:', upsertError);
      return { success: false };
    }

    // Recalculate course progress
    const { count: totalCount } = await supabase
      .from('lectures')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    const { count: completedCount } = await supabase
      .from('lecture_progress')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', user.id)
      .eq('course_id', courseId)
      .eq('is_completed', true);

    const total = totalCount ?? 0;
    const completed = completedCount ?? 0;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Update enrollment progress
    const updatePayload: Record<string, any> = {
      progress_percent: progressPercent,
      last_accessed_at: new Date().toISOString(),
    };

    if (progressPercent === 100) {
      updatePayload.completed_at = new Date().toISOString();
    }

    await supabase
      .from('enrollments')
      .update(updatePayload)
      .eq('student_id', user.id)
      .eq('course_id', courseId);

    // Log activity
    try {
      await logActivity('lecture_complete', { courseId, lectureId });
    } catch (_) {}

    // If course complete, log + issue certificate
    if (progressPercent === 100) {
      try {
        await logActivity('course_complete', { courseId });
      } catch (_) {}

      // Issue certificate if not already exists
      const { data: existingCert } = await supabase
        .from('certificates')
        .select('id')
        .eq('student_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (!existingCert) {
        const certNumber = `SLATE-${Date.now()}-${user.id.slice(0, 6).toUpperCase()}`;
        await supabase.from('certificates').insert({
          student_id: user.id,
          course_id: courseId,
          certificate_number: certNumber,
          issued_at: new Date().toISOString(),
        });

        // Notification
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'course_complete',
          title: 'Course Completed!',
          title_ta: null,
          message: 'You have earned a certificate of completion.',
          message_ta: null,
          link: '/dashboard/my-courses',
          is_read: false,
        });
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/progress');
    revalidatePath('/dashboard/my-courses');

    return { success: true };
  } catch (err) {
    console.error('markLectureComplete error:', err);
    return { success: false };
  }
}
