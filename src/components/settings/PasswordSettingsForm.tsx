'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Lock, Loader2, Eye, EyeOff, Shield, Info, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PasswordSettingsFormProps {
  provider?: string;
}

export function PasswordSettingsForm({ provider }: PasswordSettingsFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isGoogle = provider === 'google';

  const criteria = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'Contains number', met: /[0-9]/.test(newPassword) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const strength = criteria.filter(c => c.met).length;
  
  const strengthInfo = [
    { label: 'Too short', color: 'bg-gray-200' },
    { label: 'Weak', color: 'bg-red-500' },
    { label: 'Fair', color: 'bg-amber-500' },
    { label: 'Good', color: 'bg-blue-500' },
    { label: 'Strong', color: 'bg-emerald-500' },
  ][strength];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strength < 4) {
      toast.error('Password does not meet all security criteria.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password: newPassword });
      if (err) {
        toast.error(err.message);
      } else {
        toast.success('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
        setIsFocused(false);
      }
    } catch (err) {
      toast.error('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden p-6 mb-5">
      <div className="flex items-center gap-2 mb-6">
        <Shield size={18} className="text-gray-500" />
        <h2 className="text-gray-900 font-semibold text-lg">Security</h2>
      </div>

      {isGoogle ? (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-900 font-medium text-sm">You signed in with Google</p>
            <p className="text-gray-500 text-sm mt-1">
              Your password is managed by Google. To change it, visit your Google account security settings.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-2">
            <label className="text-gray-700 text-sm font-medium">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onFocus={() => setIsFocused(true)}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-900 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <div className="space-y-2 mt-3">
                <div className="flex gap-1.5 h-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex-1 rounded-full transition-all duration-300',
                        i <= strength ? strengthInfo.color : 'bg-gray-100'
                      )}
                    />
                  ))}
                </div>
                <p className={cn('text-[11px] font-bold uppercase tracking-wider', strength > 0 ? strengthInfo.color.replace('bg-', 'text-') : 'text-gray-400')}>
                  {strengthInfo.label}
                </p>
              </div>
            )}

            {/* Criteria Checklist */}
            {(isFocused || newPassword.length > 0) && (
              <div className="bg-gray-50 rounded-xl p-4 mt-3 space-y-2 border border-gray-100">
                {criteria.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {c.met ? (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : (
                      <Circle size={14} className="text-gray-300" />
                    )}
                    <span className={cn(c.met ? 'text-emerald-700 font-medium' : 'text-gray-500')}>
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-gray-700 text-sm font-medium">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-900 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || strength < 4 || newPassword !== confirmPassword}
            className="inline-flex items-center gap-2 bg-black text-white text-sm font-bold rounded-lg px-6 py-2.5 hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
            Update Password
          </button>
        </form>
      )}
    </div>
  );
}
