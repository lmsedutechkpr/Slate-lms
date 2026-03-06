import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import InstructorShell from '@/components/instructor/InstructorShell';

export default async function InstructorLayout({
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

  if (!profile || profile.role !== 'instructor') {
    if (profile?.role === 'admin') {
      redirect('/admin/dashboard');
    }
    redirect('/dashboard');
  }

  return (
    <InstructorShell profile={profile}>
      {children}
    </InstructorShell>
  );
}
