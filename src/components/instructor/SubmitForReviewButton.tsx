'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { submitCourseForReview } from '@/lib/actions/instructor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SubmitForReviewButtonProps {
  courseId: string;
  instructorId: string;
  isReady: boolean;
}

export default function SubmitForReviewButton({
  courseId,
  instructorId,
  isReady,
}: SubmitForReviewButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    setLoading(true);

    try {
      const result = await submitCourseForReview(courseId, instructorId);

      if (result.success) {
        setSubmitted(true);
        toast.success('Course submitted!', {
          description: 'Admin will review within 1-3 days.',
          duration: 5000,
        });
        // Refresh the page to show new status
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        toast.error('Submission failed', {
          description: result.error,
        });
      }
    } catch (error: any) {
      toast.error('An error occurred', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          disabled={!isReady || loading || submitted}
          className={`w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-150 ${
            submitted
              ? 'bg-emerald-600 text-white'
              : isReady
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          title={!isReady ? 'Complete the checklist first' : ''}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitted && <CheckCircle2 className="w-4 h-4" />}
          {!loading && !submitted && <Send className="w-4 h-4" />}

          {loading
            ? 'Submitting...'
            : submitted
            ? 'Submitted for Review!'
            : 'Submit for Review'}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Submit for Review?</AlertDialogTitle>
          <AlertDialogDescription>
            Once submitted, you cannot edit the course until admin review is
            complete. Make sure everything is ready.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            className="bg-black text-white hover:bg-gray-800 rounded-xl"
          >
            Submit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
