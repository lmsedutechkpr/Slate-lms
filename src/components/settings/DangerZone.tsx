'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2 } from 'lucide-react';

export function DangerZone() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const clearUser = useAuthStore((state) => state.clearUser);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      clearUser();
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-red-100 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-red-100">
        <h2 className="text-base font-semibold text-red-600 flex items-center gap-2">
          <AlertTriangle size={16} />
          Danger Zone
        </h2>
      </div>
      <div className="px-6 py-5 space-y-4">
        {/* Sign out all devices */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Sign out of all devices</p>
            <p className="text-xs text-gray-500 mt-0.5">
              This will sign you out everywhere you&apos;re currently logged in.
            </p>
          </div>
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex-shrink-0 text-sm font-medium text-red-500 border border-red-200 rounded-xl px-4 py-2 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowConfirm(false)}
                className="text-sm font-medium text-gray-600 border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="inline-flex items-center gap-2 text-sm font-medium text-white bg-red-500 border border-red-500 rounded-xl px-4 py-2 hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                Confirm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
