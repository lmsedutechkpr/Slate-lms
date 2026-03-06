'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { AlertTriangle, LogOut, Loader2, Trash2 } from 'lucide-react';
import { deleteAccount } from '@/lib/actions/profile';
import { format } from 'date-fns';

interface AccountSectionProps {
  createdAt: string;
}

export function AccountSection({ createdAt }: AccountSectionProps) {
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const clearUser = useAuthStore((state) => state.clearUser);
  const router = useRouter();

  const handleSignOutAll = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut({ scope: 'global' });
      clearUser();
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        clearUser();
        router.push('/');
      }
    } finally {
      setDeleting(false);
    }
  };

  const joined = createdAt ? format(new Date(createdAt), 'MMMM d, yyyy') : '—';

  return (
    <div className="bg-white border border-red-100 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-red-100">
        <h2 className="text-base font-semibold text-red-600 flex items-center gap-2">
          <AlertTriangle size={16} />
          Account
        </h2>
      </div>
      <div className="px-6 py-5 space-y-5">
        {/* Account created */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Account created</p>
            <p className="text-xs text-gray-400 mt-0.5">{joined}</p>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Sign out all devices */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Sign out of all devices</p>
            <p className="text-xs text-gray-500 mt-0.5">
              This will sign you out everywhere you&apos;re currently logged in.
            </p>
          </div>
          {!showSignOutConfirm ? (
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <LogOut size={13} />
              Sign Out All
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="text-sm font-medium text-gray-600 border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOutAll}
                disabled={loading}
                className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gray-900 rounded-xl px-4 py-2 hover:bg-black transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                Confirm
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100" />

        {/* Delete Account */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-red-600">Delete Account</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Permanently delete your account and all data. This cannot be undone.
            </p>
          </div>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-red-500 border border-red-200 rounded-xl px-4 py-2 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} />
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-sm font-medium text-gray-600 border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="inline-flex items-center gap-2 text-sm font-medium text-white bg-red-500 rounded-xl px-4 py-2 hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
                Delete Forever
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
