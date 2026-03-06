'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';
import { Sliders, Globe2, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PreferencesFormProps {
  profile: Profile;
}

const INTEREST_OPTIONS = [
  'Technology',
  'Business',
  'Design',
  'Marketing',
  'Personal Development',
  'Photography',
  'Music',
  'Health & Fitness',
  'Finance',
  'Cooking',
];

export function PreferencesForm({ profile }: PreferencesFormProps) {
  const [language, setLanguage] = useState<'en' | 'ta'>(profile.preferred_language ?? 'en');
  const [interests, setInterests] = useState<string[]>(profile.interests ?? []);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (interests.length === 0) {
      toast.error('Please select at least one interest.');
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          preferred_language: language,
          interests: interests,
        })
        .eq('id', profile.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Preferences saved!');
        router.refresh();
      }
    } catch (err) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden p-6 mb-5">
      <div className="flex items-center gap-2 mb-6">
        <Sliders size={18} className="text-gray-500" />
        <h2 className="text-gray-900 font-semibold text-lg">Preferences</h2>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Language Selection */}
        <div className="space-y-4">
          <label className="text-gray-700 text-sm font-medium">Preferred Language</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'en', label: 'English', native: 'English' },
              { id: 'ta', label: 'Tamil', native: 'தமிழ்' },
            ].map((opt) => (
              <div
                key={opt.id}
                onClick={() => setLanguage(opt.id as 'en' | 'ta')}
                className={cn(
                  'relative border-2 rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 group',
                  language === opt.id
                    ? 'border-black bg-black text-white'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  language === opt.id ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-gray-100'
                )}>
                  <Globe2 size={20} className={language === opt.id ? 'text-white' : 'text-gray-400'} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm leading-none">{opt.label}</p>
                  <p className={cn('text-[10px] mt-1.5 font-medium uppercase tracking-wider opacity-60', language === opt.id ? 'text-white' : 'text-gray-400')}>
                    {opt.native}
                  </p>
                </div>
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all',
                  language === opt.id ? 'border-white' : 'border-gray-200'
                )}>
                  {language === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Interests */}
        <div className="space-y-4">
          <div>
            <label className="text-gray-700 text-sm font-medium">Learning Interests</label>
            <p className="text-gray-400 text-xs mt-1">Select topics you're interested in to get better recommendations</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const selected = interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs font-bold transition-all border-2',
                    selected
                      ? 'bg-black border-black text-white'
                      : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                  )}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || interests.length === 0}
          className="inline-flex items-center gap-2 bg-black text-white text-sm font-bold rounded-lg px-6 py-2.5 hover:bg-gray-800 transition-all disabled:opacity-40"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Preferences
        </button>
      </form>
    </div>
  );
}
