'use client';

import { create } from 'zustand';

interface CartStore {
  cartCount: number;
  setCartCount: (n: number) => void;
  increment: (by?: number) => void;
  decrement: (by?: number) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cartCount: 0,
  setCartCount: (n) => set({ cartCount: n }),
  increment: (by = 1) =>
    set((s) => ({ cartCount: Math.max(0, s.cartCount + by) })),
  decrement: (by = 1) =>
    set((s) => ({ cartCount: Math.max(0, s.cartCount - by) })),
}));
