'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { approveInstructor } from '@/lib/actions/admin';
import { toast } from 'sonner';

interface InstructorQuickApproveProps {
  instructorId: string;
}

export default function InstructorQuickApprove({ instructorId }: InstructorQuickApproveProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    const result = await approveInstructor(instructorId);
    setLoading(false);
    if (result.success) {
      toast.success('Instructor approved!');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to approve');
    }
  };

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className="flex items-center gap-1.5 bg-emerald-600 text-white rounded-xl px-3 py-1.5 text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors"
    >
      {loading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <CheckCircle size={12} />
      )}
      Approve
    </button>
  );
}
