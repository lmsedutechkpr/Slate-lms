'use client';

import { useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface MarkAllReadButtonProps {
  userId: string;
}

export function MarkAllReadButton({ userId }: MarkAllReadButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMarkAll = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleMarkAll}
      disabled={loading}
      className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50 flex-shrink-0"
    >
      <CheckCheck size={14} />
      Mark all read
    </button>
  );
}
