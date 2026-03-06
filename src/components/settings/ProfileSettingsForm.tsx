'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';
import { User, Save, Loader2 } from 'lucide-react';

interface ProfileSettingsFormProps {
  profile: Profile;
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const [fullName, setFullName] = useState(profile.full_name ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const initial =
    profile.full_name?.charAt(0)?.toUpperCase() ||
    profile.email?.charAt(0)?.toUpperCase() ||
    'S';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() || null, bio: bio.trim() || null })
        .eq('id', profile.id);

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <User size={16} className="text-gray-500" />
          Profile Information
        </h2>
      </div>
      <form onSubmit={handleSave} className="px-6 py-5 space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name ?? 'Avatar'}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-xl">{initial}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{profile.email}</p>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{profile.role}</p>
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all"
          />
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell us a little about yourself..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all resize-none"
          />
        </div>

        {/* Error / Success */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
        )}
        {success && (
          <p className="text-sm text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-xl">
            Profile updated successfully!
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium rounded-xl px-5 py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
