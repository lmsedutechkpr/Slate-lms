'use server';

import { createClient } from '@/lib/supabase/server';
import { CartItem } from '@/types';
import { enrollInCourse } from './enrollments';
import { revalidatePath } from 'next/cache';

interface PlaceOrderArgs {
  name: string;
  phone: string;
  paymentMethod: 'cod' | 'upi';
  paymentReference: string | null;
}

interface PlaceOrderResult {
  orderId: string | null;
  error: string | null;
}

export async function placeOrder(args: PlaceOrderArgs): Promise<PlaceOrderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { orderId: null, error: 'Not authenticated' };

  // Fetch cart items
  const { data: cartRows, error: cartErr } = await supabase
    .from('cart_items')
    .select(
      `*, course:courses(id, title, slug, thumbnail_url, price), product:products(id, name, slug, images, price, stock_quantity)`
    )
    .eq('student_id', user.id);

  if (cartErr) return { orderId: null, error: cartErr.message };
  if (!cartRows || cartRows.length === 0) return { orderId: null, error: 'Your cart is empty.' };

  const items = cartRows as CartItem[];

  // Validate stock for product items
  for (const item of items) {
    if (item.item_type === 'product' && item.product) {
      const product = Array.isArray(item.product) ? item.product[0] : item.product;
      const stock = product?.stock_quantity ?? 0;
      if (item.quantity > stock) {
        return {
          orderId: null,
          error: `"${product?.name}" only has ${stock} unit${stock !== 1 ? 's' : ''} available.`,
        };
      }
    }
  }

  const getItemPrice = (item: CartItem) => {
    if (item.item_type === 'course') {
        const course = Array.isArray(item.course) ? item.course[0] : item.course;
        return course?.price ?? 0;
    } else {
        const product = Array.isArray(item.product) ? item.product[0] : item.product;
        return product?.price ?? 0;
    }
  }

  const getItemName = (item: CartItem) => {
    if (item.item_type === 'course') {
        const course = Array.isArray(item.course) ? item.course[0] : item.course;
        return course?.title ?? 'Course';
    } else {
        const product = Array.isArray(item.product) ? item.product[0] : item.product;
        return product?.name ?? 'Product';
    }
  }

  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);

  // Fetch profile for billing email
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single();

  // Create order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      student_id: user.id,
      status: 'pending',
      total_amount: subtotal,
      payment_method: args.paymentMethod,
      payment_reference: args.paymentReference,
      billing_details: { name: args.name, email: profile?.email ?? '', phone: args.phone },
    })
    .select('id')
    .single();

  if (orderErr || !order) return { orderId: null, error: orderErr?.message ?? 'Failed to create order.' };

  // Create order items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    item_type: item.item_type,
    course_id: item.course_id ?? null,
    product_id: item.product_id ?? null,
    item_name: getItemName(item),
    quantity: item.quantity,
    unit_price: getItemPrice(item),
    total_price: getItemPrice(item) * item.quantity,
  }));

  const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
  if (itemsErr) return { orderId: null, error: itemsErr.message };

  // Clear cart
  await supabase.from('cart_items').delete().eq('student_id', user.id);

  // Enroll in courses
  const courseItems = items.filter((i) => i.item_type === 'course' && i.course_id);
  const courseNames: string[] = [];
  if (courseItems.length > 0) {
    for (const item of courseItems) {
      if (item.course_id) {
        await enrollInCourse(item.course_id);
        const course = Array.isArray(item.course) ? item.course[0] : item.course;
        courseNames.push(course?.title ?? 'Course');
      }
    }

    // Insert course access notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'course',
      title: 'Course Access Granted',
      title_ta: 'கோர்ஸ் அணுகல் வழங்கப்பட்டது',
      message: `You are now enrolled in: ${courseNames.join(', ')}`,
      link: '/dashboard/my-courses',
      is_read: false,
    });
  }

  // Insert order confirmation notification
  const shortId = order.id.split('-')[0].toUpperCase();
  await supabase.from('notifications').insert({
    user_id: user.id,
    type: 'order',
    title: 'Order Confirmed',
    title_ta: 'ஆர்டர் உறுதிப்படுத்தப்பட்டது',
    message: `Order #${shortId} placed for ₹${subtotal.toLocaleString('en-IN')}`,
    link: `/dashboard/orders/${order.id}`,
    is_read: false,
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/my-courses');
  revalidatePath('/dashboard/orders');

  return { orderId: order.id, error: null };
}
