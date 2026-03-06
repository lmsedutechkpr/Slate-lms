'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  X,
  CheckCircle2,
  UserCircle,
  Clock,
  BookOpen,
  ShoppingCart,
  ArrowRight,
  Play,
  Star,
} from 'lucide-react';
import { WishlistItem } from '@/types';
import { CourseThumbnail } from '@/components/shared/CourseThumbnail';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { enrollInCourse } from '@/lib/actions/enrollments';
import { moveToCart } from '@/lib/actions/wishlist';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

interface WishlistCourseCardProps {
  item: WishlistItem;
  isEnrolled: boolean;
  onRemove: () => void;
  lang: 'en' | 'ta';
  studentId: string;
}

export function WishlistCourseCard({
  item,
  isEnrolled,
  onRemove,
  lang,
  studentId,
}: WishlistCourseCardProps) {
  const [cartLoading, setCartLoading] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const router = useRouter();
  const { increment, decrement } = useCartStore();

  if (!item.course) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
        <p className="text-gray-400 text-sm">This course is no longer available.</p>
        <button
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium"
        >
          <X size={13} />
          Remove
        </button>
      </div>
    );
  }

  const course = item.course;
  const title = (lang === 'ta' && course.title_ta) ? course.title_ta : course.title;
  const category = Array.isArray(course.category) ? course.category[0] : course.category;
  const instructor = Array.isArray(course.instructor) ? course.instructor[0] : course.instructor;

  const hours = Math.floor((course.duration_minutes ?? 0) / 60);
  const mins = (course.duration_minutes ?? 0) % 60;
  const durationStr =
    hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins}m`;

  const handleAddToCart = async () => {
    setCartLoading(true);
    try {
      const result = await moveToCart(course.id, studentId);
      if (result.success) {
        increment(1);
        toast.success('Added to cart');
      } else {
        toast.error('Failed to add to cart');
      }
    } finally {
      setCartLoading(false);
    }
  };

  const handleEnrollFree = async () => {
    setEnrollLoading(true);
    try {
      const result = await enrollInCourse(course.id);
      if (result.success) {
        if (result.hadInCart) {
          decrement(1);
        }
        onRemove();
        router.push(`/courses/${course.slug}/learn`);
      } else {
        toast.error(result.error ?? 'Failed to enroll');
      }
    } finally {
      setEnrollLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors flex flex-col">
      {/* Thumbnail */}
      <div className="relative aspect-video group">
        <CourseThumbnail
          thumbnailUrl={course.thumbnail_url}
          title={course.title}
          categorySlug={category?.slug}
          categoryName={category?.name}
          aspectRatio="video"
        />

        {/* Category badge top-left */}
        {category && (
          <div className="absolute top-3 left-3">
            <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider">
              {category.name}
            </span>
          </div>
        )}

        {/* Remove button top-right */}
        <div className="absolute top-3 right-3">
          <button
            onClick={onRemove}
            className="bg-white/80 backdrop-blur rounded-full p-1.5 text-gray-500 hover:text-red-500 transition-colors"
            title="Remove from wishlist"
          >
            <X size={14} />
          </button>
        </div>

        {/* Already enrolled overlay */}
        {isEnrolled && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs font-semibold text-center py-1.5 flex items-center justify-center gap-1">
            <CheckCircle2 size={11} />
            Already Enrolled
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Difficulty */}
        {course.difficulty && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {course.difficulty}
          </span>
        )}

        {/* Title */}
        <h3 className="text-gray-900 font-semibold text-[15px] line-clamp-2 mt-2 mb-1">
          {title}
        </h3>

        {/* Instructor */}
        {instructor?.full_name && (
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <UserCircle size={13} className="text-gray-400" />
            {instructor.full_name}
          </div>
        )}

        {/* Rating */}
        {course.rating > 0 && (
          <div className="flex items-center gap-1 mt-1.5 text-xs">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="font-semibold text-gray-700">{course.rating.toFixed(1)}</span>
            {course.rating_count > 0 && (
              <span className="text-gray-400">({course.rating_count.toLocaleString()})</span>
            )}
          </div>
        )}

        {/* Meta */}
        {(course.duration_minutes > 0 || course.total_lectures > 0) && (
          <div className="flex items-center gap-2 mt-1.5 text-gray-400 text-xs">
            {course.duration_minutes > 0 && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {durationStr}
              </span>
            )}
            {course.duration_minutes > 0 && course.total_lectures > 0 && (
              <span>·</span>
            )}
            {course.total_lectures > 0 && (
              <span className="flex items-center gap-1">
                <BookOpen size={12} />
                {course.total_lectures} lectures
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Price */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <PriceDisplay price={course.price} />
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex gap-2">
          {isEnrolled ? (
            <Link
              href={`/courses/${course.slug}/learn`}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-black text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-800 transition-colors"
            >
              <Play size={14} />
              Go to Course
            </Link>
          ) : course.price === 0 ? (
            <button
              onClick={handleEnrollFree}
              disabled={enrollLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-black text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Play size={14} />
              {enrollLoading ? 'Enrolling...' : 'Enroll Free'}
            </button>
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-black text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <ShoppingCart size={14} />
                {cartLoading ? 'Adding...' : 'Add to Cart'}
              </button>
              <Link
                href={`/courses/${course.slug}`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
              >
                <ArrowRight size={14} />
                Enroll
              </Link>
            </>
          )}
        </div>

        {/* Saved date */}
        <p className="text-gray-400 text-[11px] mt-2 flex items-center gap-1">
          <Clock size={11} />
          Saved{' '}
          {formatDistanceToNow(new Date(item.added_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
