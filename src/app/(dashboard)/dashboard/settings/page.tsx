import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PasswordSettingsForm } from '@/components/settings/PasswordSettingsForm';
import { PreferencesForm } from '@/components/settings/PreferencesForm';
import { NotificationsForm } from '@/components/settings/NotificationsForm';
import { DangerZone } from '@/components/settings/DangerZone';
import { getTranslation } from '@/lib/i18n';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/onboarding');

  const { t } = getTranslation(profile.preferred_language || 'en');

  // Detect auth provider
  const provider = user.app_metadata?.provider ?? 'email';

  return (
    <div className="-m-4 lg:-m-8 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-6">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-gray-700 transition-colors">
            {t('common.dashboard')}
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-900">{t('settings.title')}</span>
        </div>
        <div className="mt-2">
          <h1 className="text-gray-900 font-bold text-2xl tracking-tight">{t('settings.title')}</h1>
          <p className="mt-1 text-gray-500 text-sm">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8 max-w-2xl space-y-6">
        <PasswordSettingsForm provider={provider} />
        <PreferencesForm profile={profile} />
        <NotificationsForm profile={profile} />
        <DangerZone />
      </div>
    </div>
  );
}
