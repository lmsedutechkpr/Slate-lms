import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Profile } from '@/types';
import { getProfileStats } from '@/lib/actions/profile';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { DangerZone } from '@/components/settings/DangerZone';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profileData) redirect('/onboarding');

  const profile = profileData as Profile;
  const stats = await getProfileStats(profile.id);

  return (
    <div className="-m-4 lg:-m-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-6">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-gray-700 transition-colors">
            Dashboard
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-900">Profile</span>
        </div>
        <div className="mt-2">
          <h1 className="text-gray-900 font-bold text-2xl tracking-tight">My Profile</h1>
          <p className="mt-1 text-gray-500 text-sm">Who you are — your identity on Slate</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-8 py-8">
        <div className="max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6 items-start">
            {/* Left column — Profile card */}
            <ProfileCard
              profile={profile}
              enrolledCount={stats.enrolledCount}
              completedCount={stats.completedCount}
              certificateCount={stats.certificateCount}
            />

            {/* Right column — Edit form + danger zone */}
            <div className="space-y-5">
              <AvatarUpload
                currentUrl={profile.avatar_url}
                displayName={profile.full_name || profile.email?.split('@')[0] || 'Student'}
              />
              <ProfileEditForm
                initialName={profile.full_name ?? ''}
                initialBio={profile.bio ?? ''}
              />
              <DangerZone />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
