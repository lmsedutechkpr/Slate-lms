'use client';

import { Course } from '@/types';
import { EnrollButton } from '@/components/courses/EnrollButton';
import { WishlistButton } from '@/components/courses/WishlistButton';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { CourseThumbnail } from '@/components/shared/CourseThumbnail';
import { PlayCircle, BookOpen, Clock, Globe, Award, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnrollSidebarProps {
  course: Course;
  isEnrolled: boolean;
  isInCart: boolean;
  isWishlisted: boolean;
  isLoggedIn: boolean;
  studentId: string | null;
}

const LANGUAGE_LABEL: Record<string, string> = {
  en: 'English',
  ta: 'Tamil',
  both: 'Tamil & English',
};

export function EnrollSidebar({
  course,
  isEnrolled,
  isInCart,
  isWishlisted,
  isLoggedIn,
  studentId,
}: EnrollSidebarProps) {
  const durationHours = Math.floor((course.duration_minutes || 0) / 60);
  const durationMins = (course.duration_minutes || 0) % 60;
  const durationStr =
    durationHours > 0
      ? `${durationHours}h${durationMins > 0 ? ` ${durationMins}m` : ''}`
      : `${durationMins}m`;

  const includes = [
    { icon: PlayCircle, label: `${durationStr} on-demand video` },
    ...(course.total_lectures > 0
      ? [{ icon: BookOpen, label: `${course.total_lectures} lectures` }]
      : []),
    { icon: Globe, label: `${LANGUAGE_LABEL[course.language] ?? course.language}` },
    { icon: Award, label: 'Certificate of completion' },
    { icon: Clock, label: 'Full lifetime access' },
  ];

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Thumbnail */}
      <div className="relative">
        <CourseThumbnail course={course} />
      </div>

      <div className="p-5 space-y-5">
        {/* Enroll CTA */}
        <EnrollButton
          course={course}
          isEnrolled={isEnrolled}
          isInCart={isInCart}
          studentId={studentId}
        />

        {/* Wishlist */}
        <WishlistButton
          courseId={course.id}
          isWishlisted={isWishlisted}
          variant="standalone"
          size="md"
        />

        {/* Course includes */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            This course includes
          </p>
          <div className="space-y-2.5">
            {includes.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <item.icon size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
