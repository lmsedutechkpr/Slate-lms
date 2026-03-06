'use server';

import { createClient } from '@/lib/supabase/server';
import { CartItem } from '@/types';

export async function getCartItems(studentId?: string): Promise<CartItem[]> {
  const supabase = await createClient();
  
  let targetId = studentId;
  if (!targetId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    targetId = user.id;
  }

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      student_id,
      item_type,
      quantity,
      added_at,
      course_id,
      product_id,
      course:courses (
        id,
        title,
        title_ta,
        slug,
        thumbnail_url,
        price,
        difficulty,
        language,
        category:categories (
          id,
          name,
          name_ta,
          slug,
          color
        ),
        instructor:profiles (
          id,
          full_name
        )
      ),
      product:products (
        id,
        name,
        name_ta,
        slug,
        images,
        price,
        stock_quantity,
        category:product_categories (
          id,
          name,
          name_ta,
          slug
        )
      )
    `)
    .eq('student_id', targetId)
    .order('added_at', { ascending: false });

  if (error) {
    console.error('getCartItems error:', error);
    return [];
  }

  // Return empty array if no data
  if (!data || data.length === 0) return [];

  return data as any as CartItem[];
}

export async function removeCartItem(cartItemId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
    .eq('student_id', user.id);

  return { error: error?.message ?? null };
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  if (quantity < 1) {
    return removeCartItem(cartItemId);
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
    .eq('student_id', user.id);

  return { error: error?.message ?? null };
}

export async function clearCart(): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('student_id', user.id);

  return { error: error?.message ?? null };
}

export async function addToCart({
  itemType,
  courseId,
  productId,
  quantity = 1,
}: {
  itemType: 'course' | 'product';
  courseId?: string;
  productId?: string;
  quantity?: number;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Server-side stock check for products
  if (itemType === 'product' && productId) {
    const { data: productData } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', productId)
      .single();

    if (!productData) return { error: 'Product not found' };

    const stockQty = productData.stock_quantity ?? 0;

    // Get student's current carted quantity for this product
    const { data: existingRow } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('student_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    const currentQty = existingRow?.quantity ?? 0;
    const available = Math.max(0, stockQty - currentQty);

    if (quantity > available) {
      return { error: available === 0 ? 'Already at maximum stock in cart' : `Only ${available} more unit${available !== 1 ? 's' : ''} available` };
    }
  }

  // Check if already in cart
  if (itemType === 'course' && courseId) {
    // Check if already enrolled
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (enrollment) {
      return { error: 'Already enrolled in this course' };
    }

    // Check if already in cart (for courses, no quantity increase)
    const { data: existingCourse } = await supabase
      .from('cart_items')
      .select('id')
      .eq('student_id', user.id)
      .eq('item_type', 'course')
      .eq('course_id', courseId)
      .maybeSingle();

    if (existingCourse) {
      return { error: 'Already in cart' };
    }
  }

  const filter = itemType === 'course'
    ? supabase.from('cart_items').select('id, quantity').eq('student_id', user.id).eq('item_type', 'course').eq('course_id', courseId!)
    : supabase.from('cart_items').select('id, quantity').eq('student_id', user.id).eq('item_type', 'product').eq('product_id', productId!);

  const { data: existing } = await filter.maybeSingle();

  if (existing && itemType === 'product') {
    // Update quantity (only for products)
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id);
    return { error: error?.message ?? null };
  }

  const { error } = await supabase.from('cart_items').insert({
    student_id: user.id,
    item_type: itemType,
    course_id: courseId ?? null,
    product_id: productId ?? null,
    quantity,
  });

  return { error: error?.message ?? null };
}
