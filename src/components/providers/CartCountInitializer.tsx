'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';

export function CartCountInitializer({
  initialCount,
}: {
  initialCount: number;
}) {
  const setCartCount = useCartStore((s) => s.setCartCount);
  useEffect(() => {
    setCartCount(initialCount);
  }, [initialCount, setCartCount]);
  return null;
}
