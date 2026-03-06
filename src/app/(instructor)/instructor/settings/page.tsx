import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InstructorSettingsForm from '@/components/instructor/InstructorSettingsForm';

export default async function InstructorSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return (
    <div className="h-full overflow-y-auto p-8 pb-20">
      <div className="max-w-4xl mx-auto px-8 py-8">
      <div className="mb-12">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Public Profile</h1>
        <p className="text-gray-500 font-medium text-sm mt-1">Manage your professional identity and public information.</p>
      </div>

      <InstructorSettingsForm profile={profile} />
      </div>
    </div>
  );
}
