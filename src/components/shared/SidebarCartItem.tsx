'use client';

import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function SidebarCartItem() {
  const cartCount = useCartStore((s) => s.cartCount);
  const pathname = usePathname();
  const isActive = pathname === '/dashboard/cart';

  return (
    <Link
      href="/dashboard/cart"
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        isActive
          ? 'bg-black text-white'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <ShoppingCart
        className={`w-[18px] h-[18px] ${isActive ? 'text-white' : 'text-gray-400'}`}
      />
      <span className="flex-1">Cart</span>
      {cartCount > 0 && (
        <span
          className={`min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 ${
            isActive ? 'bg-white text-black' : 'bg-black text-white'
          }`}
        >
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </Link>
  );
}
