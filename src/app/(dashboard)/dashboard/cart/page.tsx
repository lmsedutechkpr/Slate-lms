import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getCartItems } from '@/lib/actions/cart';
import { CartView } from '@/components/cart/CartView';

export default async function CartPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  const cartItems = await getCartItems(profile.id);

  return (
    <div className="-m-4 lg:-m-8 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-6">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-gray-700 transition-colors">Dashboard</Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-900">Cart</span>
        </div>
        <div className="mt-2">
          <h1 className="text-gray-900 font-bold text-2xl tracking-tight">Your Cart</h1>
          <p className="mt-1 text-gray-500 text-sm">
            {cartItems.length === 0 ? 'Your cart is empty' : `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart`}
          </p>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8">
        <CartView initialItems={cartItems} />
      </div>
    </div>
  );
}
