'use client';

import Link from 'next/link';
import { Course, Enrollment } from '@/types';
import { CourseThumbnail } from '@/components/shared/CourseThumbnail';
import { StarRating } from '@/components/shared/StarRating';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { WishlistButton } from '@/components/courses/WishlistButton';
import { Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
  showProgress?: boolean;
  enrollment?: Enrollment;
  isEnrolled?: boolean;
  isWishlisted?: boolean;
  className?: string;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner:     'text-emerald-700 bg-emerald-50',
  intermediate: 'text-amber-700 bg-amber-50',
  advanced:     'text-rose-700 bg-rose-50',
};

export function CourseCard({
  course,
  showProgress,
  enrollment,
  isEnrolled = false,
  isWishlisted = false,
  className,
}: CourseCardProps) {
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
    <div
      className={cn(
        'group relative flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:-translate-y-px transition-all duration-150',
        className
      )}
    >
      <Link
        href={`/courses/${course.slug}`}
        className="absolute inset-0 z-10"
        aria-label={course.title}
      />

      {/* Thumbnail */}
      <div className="relative">
        <CourseThumbnail
          course={course}
          priority={false}
        />

        {/* Overlay badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20">
          {category?.name && (
            <span className="px-2.5 py-1 bg-black/70 backdrop-blur-sm text-white text-[11px] font-semibold rounded-full">
              {category.name}
            </span>
          )}
          <span
            className={cn(
              'px-2 py-0.5 text-[10px] font-semibold rounded-full',
              DIFFICULTY_STYLES[course.difficulty] || 'text-gray-600 bg-white/90'
            )}
          >
            {course.difficulty}
          </span>
        </div>

        {/* Wishlist */}
        <div className="absolute top-2.5 right-2.5 z-20">
          <WishlistButton
            courseId={course.id}
            isWishlisted={isWishlisted}
            variant="overlay"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-medium text-gray-900 text-[14px] leading-snug line-clamp-2 mb-2">
          {course.title}
        </h3>

        {instructor?.full_name && (
          <p className="text-xs text-gray-500 font-normal mb-2.5 truncate">
            {instructor.full_name}
          </p>
        )}

        {(course.rating ?? 0) > 0 && (
          <div className="mb-2.5">
            <StarRating
              rating={course.rating ?? 0}
              size="sm"
              showCount={course.rating_count ?? 0}
            />
          </div>
        )}

        {(durationStr || (course.total_lectures ?? 0) > 0) && (
          <div className="flex items-center gap-3 text-xs text-gray-400 font-normal mb-auto">
            {durationStr && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {durationStr}
              </span>
            )}
            {(course.total_lectures ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <BookOpen size={12} />
                {course.total_lectures} lectures
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-3.5 pt-3.5 border-t border-gray-100">
          {showProgress && enrollment ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-normal uppercase tracking-widest text-gray-400">
                <span>Progress</span>
                <span>{enrollment.progress_percent}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black rounded-full"
                  style={{ width: `${enrollment.progress_percent}%` }}
                />
              </div>
            </div>
          ) : isEnrolled ? (
            <div className="flex items-center gap-1.5">
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
