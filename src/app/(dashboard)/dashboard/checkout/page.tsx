import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getCartItems } from '@/lib/actions/cart';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const cartItems = await getCartItems();
  if (cartItems.length === 0) redirect('/dashboard/cart');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  const subtotal = cartItems.reduce((sum, item) => {
    const c = Array.isArray(item.course) ? item.course[0] : item.course;
    const p = Array.isArray(item.product) ? item.product[0] : item.product;
    const price = item.item_type === 'course' ? (c?.price ?? 0) : (p?.price ?? 0);
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="-m-4 lg:-m-8 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-6">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-gray-700 transition-colors">Dashboard</Link>
          <ChevronRight size={12} className="text-gray-400" />
          <Link href="/dashboard/cart" className="hover:text-gray-700 transition-colors">Cart</Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-900">Checkout</span>
        </div>
        <div className="mt-2">
          <h1 className="text-gray-900 font-bold text-2xl tracking-tight">Checkout</h1>
          <p className="mt-1 text-gray-500 text-sm">Review your order and complete payment</p>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8">
        <CheckoutForm
          cartItems={cartItems}
          subtotal={subtotal}
          userId={user.id}
          defaultName={profile?.full_name ?? ''}
          defaultEmail={profile?.email ?? user.email ?? ''}
        />
      </div>
    </div>
  );
}
