'use client';

import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export function CartBadge() {
  const cartCount = useCartStore((s) => s.cartCount);

  return (
    <Link
      href="/dashboard/cart"
      className="relative p-2 rounded-lg hover:bg-gray-100 transition-all duration-150"
    >
      <ShoppingCart className="w-5 h-5 text-gray-600" />
      {cartCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-1">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </Link>
  );
}
