'use server';

import { createClient } from '@/lib/supabase/server';
import { Enrollment, Wishlist } from '@/types';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/actions/activity';

// ─── enrollInCourse ───────────────────────────────────────────────────────────

export async function enrollInCourse(
  courseId: string
): Promise<{ success: boolean; error?: string; hadInCart?: boolean }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    // Check not already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (existing) return { success: false, error: 'Already enrolled' };

    // Insert enrollment
    const { error: enrollError } = await supabase.from('enrollments').insert({
      student_id: user.id,
      course_id: courseId,
      progress_percent: 0,
      enrolled_at: new Date().toISOString(),
    });

    if (enrollError) {
      console.error('enrollInCourse insert error:', enrollError);
      return { success: false, error: enrollError.message };
    }

    let hadInCart = false;
    // If course was in cart, remove it
    const { data: cartItem } = await supabase
      .from('cart_items')
      .select('id')
      .eq('student_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (cartItem) {
      await supabase.from('cart_items').delete().eq('id', cartItem.id);
      hadInCart = true;
    }

    // Increment enrollment_count via RPC
    await supabase.rpc('increment_enrollment_count', { course_id: courseId });

    // Get course info for notification
    const { data: courseData } = await supabase
      .from('courses')
      .select('title, slug')
      .eq('id', courseId)
      .single();

    // Log activity
    try {
      await logActivity('enrollment', { courseId });
    } catch (_) {}

    // Send notification
    if (courseData) {
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'enrollment',
        title: 'Enrolled successfully!',
        title_ta: null,
        message: `You're now enrolled in ${courseData.title}`,
        message_ta: null,
        link: `/courses/${courseData.slug}/learn`,
        is_read: false,
      });
    }

    revalidatePath(`/courses/${courseData?.slug ?? courseId}`);
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/my-courses');

    return { success: true, hadInCart };
  } catch (err: any) {
    console.error('enrollInCourse error:', err);
    return { success: false, error: err?.message ?? 'Something went wrong' };
  }
}

// ─── toggleWishlist ───────────────────────────────────────────────────────────

export async function toggleWishlist(
  courseId: string
): Promise<{ wishlisted: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data: existing } = await supabase
    .from('wishlist')
    .select('id')
    .eq('student_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle();

  if (existing) {
    await supabase.from('wishlist').delete().eq('id', existing.id);
    revalidatePath('/dashboard/wishlist');
    return { wishlisted: false };
  } else {
    await supabase.from('wishlist').insert({
      student_id: user.id,
      course_id: courseId,
    });
    // Log activity
    try {
      await logActivity('wishlist_add', { courseId });
    } catch (_) {}
    revalidatePath('/dashboard/wishlist');
    return { wishlisted: true };
  }
}

// ─── getStudentEnrollments ────────────────────────────────────────────────────

export async function getStudentEnrollments(): Promise<Enrollment[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from('enrollments')
      .select(
        '*, course:courses(*, category:categories(*), instructor:profiles(*))'
      )
      .eq('student_id', user.id)
      .order('last_accessed_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('getStudentEnrollments error:', error);
      return [];
    }

    return (data ?? []) as Enrollment[];
  } catch {
    return [];
  }
}

// ─── getEnrollmentStatus ──────────────────────────────────────────────────────

export async function getEnrollmentStatus(courseId: string): Promise<Enrollment | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (error) return null;
    return data as Enrollment | null;
  } catch {
    return null;
  }
}

// ─── getWishlist ──────────────────────────────────────────────────────────────

export async function getWishlist(): Promise<Wishlist[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from('wishlist')
      .select(
        '*, course:courses(*, category:categories(*), instructor:profiles(*))'
      )
      .eq('student_id', user.id)
      .order('added_at', { ascending: false });

    if (error) return [];
    return (data ?? []) as Wishlist[];
  } catch {
    return [];
  }
}
