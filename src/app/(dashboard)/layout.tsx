import { createClient } from '@/lib/supabase/server';
import { getUnreadCount } from '@/lib/actions/notifications';
import DashboardLayoutClient from './DashboardLayoutClient';
import { CartCountInitializer } from '@/components/providers/CartCountInitializer';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? '';
  const initialUnreadCount = userId ? await getUnreadCount(userId) : 0;

  let cartCount = 0;
  if (userId) {
    const { count } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', userId);
    cartCount = count ?? 0;
  }

  return (
    <>
      <CartCountInitializer initialCount={cartCount} />
      <DashboardLayoutClient
        initialUnreadCount={initialUnreadCount}
        userId={userId}
      >
        {children}
      </DashboardLayoutClient>
    </>
  );
}
