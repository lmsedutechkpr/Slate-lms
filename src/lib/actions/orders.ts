'use server';

import { createClient } from '@/lib/supabase/server';
import { Order } from '@/types';

export async function getMyOrders(studentId: string): Promise<Order[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          course:courses (
            id, title, title_ta, slug, thumbnail_url
          ),
          product:products (
            id, name, name_ta, slug, images
          )
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getMyOrders error:', error);
      return [];
    }

    return (data ?? []) as Order[];
  } catch (err) {
    console.error('getMyOrders unexpected error:', err);
    return [];
  }
}

export async function getOrderById(orderId: string, studentId: string): Promise<Order | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          course:courses (
            id, title, title_ta, slug, thumbnail_url,
            category:categories (name, color, slug)
          ),
          product:products (
            id, name, name_ta, slug, images,
            category:product_categories (name, slug)
          )
        )
      `)
      .eq('id', orderId)
      .eq('student_id', studentId)
      .single();

    if (error) {
      console.error('getOrderById error:', error);
      return null;
    }

    return data as Order;
  } catch (err) {
    console.error('getOrderById unexpected error:', err);
    return null;
  }
}
