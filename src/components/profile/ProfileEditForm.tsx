'use client';

import { useState } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { updateProfile } from '@/lib/actions/profile';
import { useRouter } from 'next/navigation';

interface ProfileEditFormProps {
  initialName: string;
  initialBio: string;
}

export function ProfileEditForm({ initialName, initialBio }: ProfileEditFormProps) {
  const [fullName, setFullName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      const result = await updateProfile({
        full_name: fullName,
        bio,
      });

      if (result.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error ?? 'Failed to save changes');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
        <p className="text-xs text-gray-400 mt-0.5">Update your name and bio</p>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            maxLength={60}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all"
          />
          <p className="text-[11px] text-gray-400 text-right">{fullName.length}/60</p>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={200}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all resize-none"
          />
          <p className="text-[11px] text-gray-400 text-right">{bio.length}/200</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl">
            <CheckCircle2 size={14} />
            Profile updated successfully!
          </div>
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
      </div>
    </form>
  );
}
