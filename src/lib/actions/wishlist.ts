'use server';

import { createClient } from '@/lib/supabase/server';
import { WishlistItem } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getWishlist(studentId: string): Promise<WishlistItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        *,
        course:courses (
          id, title, title_ta, slug,
          thumbnail_url, price,
          difficulty, language, rating, rating_count,
          duration_minutes, total_lectures,
          enrollment_count,
          category:categories (
            id, name, name_ta, slug, icon, color
          ),
          instructor:profiles (
            id, full_name, avatar_url
          )
        )
      `)
      .eq('student_id', studentId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('getWishlist error:', error);
      return [];
    }

    return ((data ?? []) as WishlistItem[]).filter((item) => item.course != null);
  } catch {
    return [];
  }
}

export async function getStudentEnrolledIds(studentId: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', studentId);

    if (error) return [];
    return (data ?? []).map((e) => e.course_id);
  } catch {
    return [];
  }
}

export async function removeFromWishlist(
  courseId: string,
  studentId: string
): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('course_id', courseId)
      .eq('student_id', studentId);

    if (error) {
      console.error('removeFromWishlist error:', error);
      return { success: false };
    }

    revalidatePath('/dashboard/wishlist');
    revalidatePath('/courses');
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function moveToCart(
  courseId: string,
  studentId: string
): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();

    // Check if already in cart
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase.from('cart_items').insert({
        student_id: studentId,
        course_id: courseId,
        item_type: 'course',
        quantity: 1,
      });

      if (error) {
        console.error('moveToCart error:', error);
        return { success: false };
      }
    }

    revalidatePath('/cart');
    return { success: true };
  } catch {
    return { success: false };
  }
}
