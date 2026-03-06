import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SellerShell from '@/components/seller/SellerShell';

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'vendor') {
    if (profile?.role === 'admin') {
      redirect('/admin/dashboard');
    }
    if (profile?.role === 'instructor') {
      redirect('/instructor/dashboard');
    }
    redirect('/dashboard');
  }

  return (
    <SellerShell profile={profile}>
      {children}
    </SellerShell>
  );
}
