'use client';

import Link from 'next/link';
import { Course } from '@/types';
import { CourseThumbnail } from '@/components/shared/CourseThumbnail';
import { StarRating } from '@/components/shared/StarRating';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { WishlistButton } from '@/components/courses/WishlistButton';
import { Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseListItemProps {
  course: Course;
  isEnrolled?: boolean;
  isWishlisted?: boolean;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: 'text-emerald-700 bg-emerald-50',
  intermediate: 'text-amber-700 bg-amber-50',
  advanced: 'text-rose-700 bg-rose-50',
};

export function CourseListItem({
  course,
  isEnrolled = false,
  isWishlisted = false,
}: CourseListItemProps) {
  const durationHours = Math.floor((course.duration_minutes || 0) / 60);
  const durationMins = (course.duration_minutes || 0) % 60;
  const durationStr =
    durationHours > 0
      ? `${durationHours}h${durationMins > 0 ? ` ${durationMins}m` : ''}`
      : durationMins > 0
      ? `${durationMins}m`
      : null;

  const category = Array.isArray(course.category) ? course.category[0] : course.category;
  const instructor = Array.isArray(course.instructor) ? course.instructor[0] : course.instructor;

  return (
    <div className="group relative flex gap-4 bg-white p-4 hover:bg-gray-50 transition-colors">
      <Link
        href={`/courses/${course.slug}`}
        className="absolute inset-0 z-10"
        aria-label={course.title}
      />

      {/* Thumbnail */}
      <div className="flex-shrink-0 w-40 sm:w-48">
        <CourseThumbnail
          thumbnailUrl={course.thumbnail_url}
          title={course.title}
          categorySlug={category?.slug}
          categoryName={category?.name}
          aspectRatio="video"
          className="rounded-lg overflow-hidden"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col py-0.5">
        {/* Top row: category + difficulty badges */}
        <div className="flex items-center gap-1.5 mb-1.5">
          {category?.name && (
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
              {category.name}
            </span>
          )}
          <span
            className={cn(
              'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
              DIFFICULTY_STYLES[course.difficulty] || 'text-gray-600 bg-gray-100'
            )}
          >
            {course.difficulty}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
          {course.title}
        </h3>

        {instructor?.full_name && (
          <p className="text-xs text-gray-500 mb-1.5 truncate">{instructor.full_name}</p>
        )}

        {(course.rating ?? 0) > 0 && (
          <div className="mb-2">
            <StarRating rating={course.rating ?? 0} size="sm" showCount={course.rating_count ?? 0} />
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto">
          {durationStr && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {durationStr}
            </span>
          )}
          {(course.total_lectures ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen size={11} />
              {course.total_lectures} lectures
            </span>
          )}
        </div>
      </div>

      {/* Right: price + wishlist */}
      <div className="flex-shrink-0 flex flex-col items-end justify-between py-0.5 z-20">
        <WishlistButton courseId={course.id} isWishlisted={isWishlisted} variant="overlay" />
        <div className="mt-auto">
          {isEnrolled ? (
            <div className="flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">Enrolled</span>
            </div>
          ) : (
            <PriceDisplay price={course.price} />
          )}
        </div>
      </div>
    </div>
  );
}
