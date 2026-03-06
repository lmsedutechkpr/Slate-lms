'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Bell, Loader2, Save } from 'lucide-react';
import { Profile, NotificationPrefs } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NotificationsFormProps {
  profile: Profile;
}

const DEFAULT_PREFS: NotificationPrefs = {
  email_updates: true,
  course_reminders: true,
  new_course_alerts: true,
};

export function NotificationsForm({ profile }: NotificationsFormProps) {
  const initial = { ...DEFAULT_PREFS, ...(profile.notification_prefs ?? {}) };
  const [prefs, setPrefs] = useState<NotificationPrefs>(initial);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const toggle = (key: keyof NotificationPrefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ notification_prefs: prefs })
        .eq('id', profile.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Notification preferences saved!');
        router.refresh();
      }
    } catch (err) {
      toast.error('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const items: { key: keyof NotificationPrefs; label: string; desc: string }[] = [
    { 
      key: 'email_updates', 
      label: 'Email Updates', 
      desc: 'Receive email updates about your courses and announcements' 
    },
    { 
      key: 'course_reminders', 
      label: 'Course Reminders', 
      desc: 'Get reminded about courses you haven\'t visited in 7 days' 
    },
    { 
      key: 'new_course_alerts', 
      label: 'New Course Alerts', 
      desc: 'Be notified when courses in your interests are published' 
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden p-6 mb-5">
      <div className="flex items-center gap-2 mb-6">
        <Bell size={18} className="text-gray-500" />
        <h2 className="text-gray-900 font-semibold text-lg">Notification Preferences</h2>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="divide-y divide-gray-100 bg-gray-50/30 rounded-2xl border border-gray-100">
          {items.map(({ key, label, desc }, idx) => (
            <div key={key} className={cn("flex items-center justify-between py-5 px-6", idx === 0 && "pt-6", idx === items.length - 1 && "pb-6")}>
              <div className="flex-1 pr-8">
                <p className="text-sm font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{desc}</p>
              </div>
              
              <button
                type="button"
                onClick={() => toggle(key)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 flex-shrink-0 border-2',
                  prefs[key] ? 'bg-black border-black' : 'bg-gray-100 border-gray-100'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300',
                    prefs[key] ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-black text-white text-sm font-bold rounded-lg px-6 py-2.5 hover:bg-gray-800 transition-all disabled:opacity-40"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Notification Settings
        </button>
      </form>
    </div>
  );
}
