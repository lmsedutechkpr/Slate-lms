'use client';

import { useState, useEffect } from 'react';
import { enrollInCourse, getEnrollmentStatus } from '@/lib/actions/enrollments';
import { addToCart } from '@/lib/actions/cart';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, PlayCircle, ShoppingCart, CheckCircle2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { Course } from '@/types';

interface EnrollButtonProps {
  course: Course;
  studentId: string | null;
  isEnrolled: boolean;
  isInCart: boolean;
}

export function EnrollButton({
  course,
  studentId,
  isEnrolled,
  isInCart,
}: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const router = useRouter();
  const increment = useCartStore((s) => s.increment);

  useEffect(() => {
    async function fetchProgress() {
      if (isEnrolled && studentId) {
        const status = await getEnrollmentStatus(course.id);
        if (status) setProgress(status.progress_percent);
      }
    }
    fetchProgress();
  }, [isEnrolled, studentId, course.id]);

  async function handleFreeEnroll() {
    if (!studentId) {
      router.push('/login');
      return;
    }
    setLoading(true);
    const result = await enrollInCourse(course.id);
    if (result.success) {
      toast.success('Enrolled successfully!');
      router.push(`/courses/${course.slug}/learn`);
    } else {
      toast.error(result.error ?? 'Enrollment failed');
    }
    setLoading(false);
  }

  async function handleAddToCart() {
    if (!studentId) {
      router.push('/login');
      return;
    }
    setLoading(true);

    const result = await addToCart({
      itemType: 'course',
      courseId: course.id,
      quantity: 1,
    });

    setLoading(false);

    if (result.error === null) {
      // Update Zustand cart count
      increment(1);

      // Flash success state
      setAddedToCart(true);

      // After 1.2s → navigate to cart
      setTimeout(() => {
        router.push('/dashboard/cart');
      }, 1200);
    } else if (result.error === 'Already in cart') {
      // Already in cart — just navigate
      router.push('/dashboard/cart');
    } else {
      toast.error(result.error ?? 'Failed to add to cart');
    }
  }

  // --- CASE 1: Not logged in ---
  if (!studentId) {
    return (
      <button
        onClick={() => router.push('/login')}
        className="w-full bg-black text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
      >
        Sign in to Enroll
      </button>
    );
  }

  // --- CASE 2: Already enrolled ---
  if (isEnrolled) {
    return (
      <div className="w-full">
        <button
          onClick={() => router.push(`/courses/${course.slug}/learn`)}
          className="w-full bg-black text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
        >
          <PlayCircle className="w-5 h-5" />
          Go to Course
        </button>
        <p className="text-emerald-600 text-xs text-center mt-2">
          You&apos;re enrolled {progress !== null ? `· ${progress}% complete` : ''}
        </p>
      </div>
    );
  }

  // --- CASE 3: Free course (price === 0), not enrolled ---
  if (course.price === 0) {
    return (
      <button
        onClick={handleFreeEnroll}
        disabled={loading}
        className="w-full bg-black text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
      >
        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Enroll for Free'}
      </button>
    );
  }

  // --- CASE 4: Paid course, already in cart ---
  if (isInCart) {
    return (
      <div className="w-full">
        <button
          onClick={() => router.push('/dashboard/cart')}
          className="w-full bg-white border-2 border-black text-black rounded-xl py-4 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          In Cart — Go to Cart
        </button>
        <p className="text-gray-400 text-xs text-center mt-2">Added to your cart</p>
      </div>
    );
  }

  // --- CASE 5: Paid course, not in cart, not enrolled ---
  const discount = 0;

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2">
          <span className="text-gray-900 font-bold text-3xl">
            ₹{course.price.toLocaleString('en-IN')}
          </span>

        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={loading || addedToCart}
        className={cn(
          'w-full rounded-xl py-4 font-semibold flex items-center justify-center gap-2 transition-all duration-150',
          addedToCart ? 'bg-emerald-600 text-white' : 'bg-black text-white hover:bg-gray-800'
        )}
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {addedToCart && <CheckCircle2 className="w-5 h-5" />}
        {!loading && !addedToCart && <ShoppingCart className="w-5 h-5" />}

        {loading
          ? 'Adding to Cart...'
          : addedToCart
          ? 'Added! Go to Cart →'
          : `Enroll Now · ₹${course.price.toLocaleString('en-IN')}`}
      </button>

      <p className="text-gray-400 text-xs text-center mt-3 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" />
        30-day money-back guarantee
      </p>
    </div>
  );
}
