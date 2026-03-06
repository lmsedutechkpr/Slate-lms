import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    const roleToDashboard: Record<string, string> = {
      student: '/dashboard',
      instructor: '/instructor/dashboard',
      vendor: '/vendor/dashboard',
    };
    redirect(roleToDashboard[profile?.role] ?? '/');
  }

  // Fetch pending counts for sidebar badges
  const [{ count: pendingCourses }, { count: pendingInstructors }] = await Promise.all([
    supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_review'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'instructor')
      .eq('approval_status', 'pending'),
  ]);

  return (
    <AdminShell
      profile={profile}
      pendingCourses={pendingCourses ?? 0}
      pendingInstructors={pendingInstructors ?? 0}
    >
      {children}
    </AdminShell>
  );
}
