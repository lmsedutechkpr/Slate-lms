'use client';

import Link from 'next/link';
import { Enrollment } from '@/types';
import { PlayCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CourseThumbnail } from '@/components/shared/CourseThumbnail';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/store/authStore';

interface ContinueLearningProps {
  enrollment: Enrollment | null;
}

function getProgressLabel(percent: number): string {
  if (percent === 0)   return 'Just started'
  if (percent < 25)    return 'Getting started'
  if (percent < 50)    return 'Making progress'
  if (percent < 75)    return 'Halfway there!'
  if (percent < 100)   return 'Almost done!'
  return 'Completed!'
}

function getProgressLabelTa(percent: number): string {
  if (percent === 0)   return 'இப்போது தொடங்கியது'
  if (percent < 25)    return 'தொடங்கி வருகிறோம்'
  if (percent < 50)    return 'முன்னேற்றம் கிடைக்கிறது'
  if (percent < 75)    return 'பாதி வழி வந்தாயிற்று!'
  if (percent < 100)   return 'கிட்டத்தட்ட முடிந்தது!'
  return 'முடிந்தது!'
}

function getCtaText(percent: number): string {
  if (percent === 0) return 'Start Course →'
  if (percent > 0 && percent < 100) return 'Resume →'
  if (percent === 100) return 'Review Course →'
  return 'Resume →'
}

export function ContinueLearning({ enrollment }: ContinueLearningProps) {
  const user = useAuthStore((state) => state.user);
  const { t, lang } = useTranslation(user?.preferred_language || 'en');

  if (!enrollment || !enrollment.course) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium tracking-tight text-gray-900">
            {t('dashboard.continueLearning')}
          </h2>
        </div>
        <div className="p-10 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <PlayCircle size={24} className="text-gray-300" />
          </div>
          <div>
            <p className="text-gray-900 font-medium text-sm">No courses started yet</p>
            <p className="text-gray-400 text-xs font-normal mt-1">
              Enroll in a course to begin your learning journey.
            </p>
          </div>
          <Link
            href="/courses"
            className="px-6 py-2.5 bg-black text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-all"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  const { course } = enrollment;
  const category = Array.isArray(course.category) ? course.category[0] : course.category;
  const instructor = Array.isArray(course.instructor) ? course.instructor[0] : course.instructor;

  const lastAccessedText = enrollment.last_accessed_at
    ? formatDistanceToNow(new Date(enrollment.last_accessed_at), { addSuffix: true })
    : null;

  const progressLabel = lang === 'ta' 
    ? getProgressLabelTa(enrollment.progress_percent) 
    : getProgressLabel(enrollment.progress_percent);

  const ctaText = getCtaText(enrollment.progress_percent);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium tracking-tight text-gray-900">
          {t('dashboard.continueLearning')}
        </h2>
        <Link
          href="/dashboard/my-courses"
          className="text-xs font-normal uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors"
        >
          {t('myCourses.allCourses')} →
        </Link>
      </div>

      <Link
        href={`/courses/${course.slug}/learn`}
        className="group block relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-gray-300 transition-all duration-150 p-6"
      >
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Thumbnail wrapper */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden flex-shrink-0 sm:w-48">
            <CourseThumbnail course={course} />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <PlayCircle size={40} className="text-white drop-shadow" />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between min-w-0 space-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {category?.name && (
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                    {category.name}
                  </span>
                )}
                {lastAccessedText && (
                  <span className="flex items-center gap-1 text-xs text-gray-400 font-normal">
                    <Clock size={12} />
                    {lastAccessedText}
                  </span>
                )}
              </div>
              <h3 className="text-base font-medium tracking-tight text-gray-900 leading-snug line-clamp-2">
                {course.title}
              </h3>
              {instructor?.full_name && (
                <p className="text-gray-500 text-xs font-normal mt-1">
                  by <span className="text-gray-700 font-medium">{instructor.full_name}</span>
                </p>
              )}
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-widest text-gray-500">
                  CONTINUE WHERE YOU LEFT OFF
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {enrollment.progress_percent}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black rounded-full transition-all"
                  style={{ width: `${enrollment.progress_percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-normal text-gray-400">
                <span>{progressLabel}</span>
                <span className="text-gray-800 font-medium group-hover:translate-x-0.5 transition-transform">
                  {ctaText}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
