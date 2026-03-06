'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Ban } from 'lucide-react';
import { approveInstructor, rejectInstructor, suspendInstructor } from '@/lib/actions/admin';
import { toast } from 'sonner';

interface InstructorApprovalActionsProps {
  instructorId: string;
  status: string;
}

export default function InstructorApprovalActions({ instructorId, status }: InstructorApprovalActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');

  const handleApprove = async () => {
    setLoading('approve');
    const result = await approveInstructor(instructorId);
    setLoading(null);
    if (result.success) {
      toast.success('Instructor approved! They can now submit courses.');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed');
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    setLoading('reject');
    const result = await rejectInstructor(instructorId, reason.trim());
    setLoading(null);
    if (result.success) {
      toast.success('Instructor application rejected');
      setShowRejectForm(false);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed');
    }
  };

  const handleSuspend = async () => {
    if (!confirm('Are you sure you want to suspend this instructor account? They will lose access to instructor features immediately.')) return;
    setLoading('suspend');
    const result = await suspendInstructor(instructorId);
    setLoading(null);
    if (result.success) {
      toast.success('Instructor account suspended');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to suspend');
    }
  };

  if (status === 'approved') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <CheckCircle size={16} className="text-emerald-600" />
          <span className="text-sm font-medium text-emerald-800">Account Approved</span>
        </div>
        <button
          onClick={handleSuspend}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 disabled:opacity-60 text-red-600 border border-red-200 font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          {loading === 'suspend' ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
          Suspend Account
        </button>
      </div>
    );
  }

  if (status === 'suspended') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4">
          <Ban size={16} className="text-red-600" />
          <span className="text-sm font-medium text-red-800">Account Suspended</span>
        </div>
        <button
          onClick={handleApprove}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          {loading === 'approve' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          Unsuspend & Approve
        </button>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4">
          <XCircle size={16} className="text-red-600" />
          <span className="text-sm font-medium text-red-800">Application Rejected</span>
        </div>
        <button
          onClick={handleApprove}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          {loading === 'approve' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          Approve Anyway
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleApprove}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
      >
        {loading === 'approve' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
        Approve Instructor
      </button>
      <button
        onClick={() => setShowRejectForm(!showRejectForm)}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-700 font-semibold py-3 px-4 rounded-xl transition-colors border border-red-200"
      >
        <XCircle size={16} />
        Reject Application
      </button>

      {showRejectForm && (
        <div className="space-y-3 pt-1">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection (sent to instructor)..."
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={loading !== null || !reason.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              {loading === 'reject' ? <Loader2 size={14} className="animate-spin" /> : 'Send Rejection'}
            </button>
            <button
              onClick={() => setShowRejectForm(false)}
              className="px-4 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
