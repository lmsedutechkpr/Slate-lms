'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, CheckCircle2, XCircle, Archive, Loader2 } from 'lucide-react';
import { approveCourse, rejectCourse, unpublishCourse } from '@/lib/actions/admin';
import { toast } from 'sonner';

interface CourseReviewActionsProps {
  courseId: string;
  initialStatus: string;
  submittedAt: string | Date | null;
  publishedAt: string | Date | null;
  rejectionReason?: string | null;
}

export default function CourseReviewActions({
  courseId,
  initialStatus,
  submittedAt,
  publishedAt,
  rejectionReason: initialRejection,
}: CourseReviewActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState(initialRejection || '');

  const handleApprove = async () => {
    setLoading('approve');
    const result = await approveCourse(courseId);
    setLoading(null);
    if (result.success) {
      toast.success('Course approved and published!');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setLoading('reject');
    const result = await rejectCourse(courseId, rejectionReason.trim());
    setLoading(null);
    if (result.success) {
      toast.success('Course rejected with feedback sent to instructor');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to reject');
    }
  };

  const handleUnpublish = async () => {
    if (!confirm('Archive this course? It will be hidden from students.')) return;
    setLoading('unpublish');
    const result = await unpublishCourse(courseId);
    setLoading(null);
    if (result.success) {
      toast.success('Course archived');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to archive');
    }
  };

  const formatRelativeTime = (dateStr: string | Date | null) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-gray-900 font-semibold">
          Review Decision
        </h3>
        <p className="text-gray-400 text-xs mt-0.5">
          Submitted {formatRelativeTime(submittedAt)}
        </p>
      </div>

      <div className="p-5">
        {initialStatus === 'pending_review' && (
          <div className="space-y-3">
            <button
              onClick={handleApprove}
              disabled={loading !== null}
              className="w-full bg-emerald-600 text-white rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-150 disabled:opacity-50">
              {loading === 'approve' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              {loading === 'approve' ? 'Approving...' : 'Approve & Publish'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-gray-400 text-xs">
                  or
                </span>
              </div>
            </div>

            <div>
              <label className="text-gray-700 text-sm font-semibold mb-2 block">
                Rejection Reason
                <span className="text-gray-400 font-normal ml-1">
                  (required)
                </span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={4}
                placeholder="Explain what the instructor needs to fix before resubmitting..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:border-gray-900 outline-none transition-150"
              />
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || loading !== null}
                className="w-full mt-2 bg-red-600 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-150">
                {loading === 'reject' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {loading === 'reject' ? 'Rejecting...' : 'Reject Course'}
              </button>
            </div>
          </div>
        )}

        {initialStatus === 'published' && (
          <div className="space-y-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-emerald-700 font-semibold text-sm">
                Published
              </p>
              <p className="text-emerald-600 text-xs mt-1">
                Live since {formatRelativeTime(publishedAt)}
              </p>
            </div>
            <button
              onClick={handleUnpublish}
              className="w-full border border-red-200 text-red-600 rounded-xl py-2.5 text-sm font-medium hover:bg-red-50 transition-150">
              {loading === 'unpublish' ? 'Unpublishing...' : 'Unpublish Course'}
            </button>
          </div>
        )}

        {initialStatus === 'rejected' && (
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <p className="text-red-700 font-semibold text-sm">
                  Rejected
                </p>
              </div>
              <p className="text-red-600 text-xs leading-relaxed">
                {initialRejection || rejectionReason}
              </p>
            </div>
            <p className="text-gray-400 text-xs text-center">
              Instructor must resubmit after fixing issues
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
