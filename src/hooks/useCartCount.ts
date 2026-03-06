'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export function useCartCount() {
  const { user } = useAuthStore();
  const cartCount = useCartStore((s) => s.cartCount);
  const setCartCount = useCartStore((s) => s.setCartCount);

  useEffect(() => {
    if (!user) { setCartCount(0); return; }

    const supabase = createClient();

    const fetchCount = async () => {
      const { count: c } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user.id);
      setCartCount(c ?? 0);
    };

    fetchCount();

    const channel = supabase
      .channel('cart_count_' + user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cart_items', filter: `student_id=eq.${user.id}` }, fetchCount)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, setCartCount]);

  return cartCount;
}
