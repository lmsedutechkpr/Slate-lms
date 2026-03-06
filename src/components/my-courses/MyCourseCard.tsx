'use client';

import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Play,
  RefreshCw,
  UserCircle,
  Clock,
  CheckCircle2,
  PlayCircle,
} from 'lucide-react';
import { Enrollment, Certificate } from '@/types';
import { CourseThumbnail } from '@/components/shared/CourseThumbnail';
import { CourseProgressBar } from './CourseProgressBar';
import { CertificateButton } from './CertificateButton';

interface MyCourseCardProps {
  enrollment: Enrollment;
  certificate: Certificate | null;
  lang: 'en' | 'ta';
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, string> = {
    beginner: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    intermediate: 'bg-amber-50 text-amber-700 border-amber-100',
    advanced: 'bg-red-50 text-red-700 border-red-100',
  };
  const label: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };
  const cls = map[difficulty] ?? 'bg-gray-50 text-gray-700 border-gray-100';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      {label[difficulty] ?? difficulty}
    </span>
  );
}

export function MyCourseCard({ enrollment, certificate, lang }: MyCourseCardProps) {
  const course = enrollment.course;

  // Deleted/null course fallback
  if (!course) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 text-gray-500 text-sm">
        This course is no longer available.
      </div>
    );
  }

  const pct = enrollment.progress_percent ?? 0;
  const isCompleted = !!enrollment.completed_at;
  const isNotStarted = pct === 0;

  const title = lang === 'ta' && course.title_ta ? course.title_ta : course.title;
  const category = Array.isArray(course.category) ? course.category[0] : course.category;
  const instructor = Array.isArray(course.instructor) ? course.instructor[0] : course.instructor;
  
  const categoryName =
    lang === 'ta' && category?.name_ta
      ? category.name_ta
      : category?.name;

  const estimatedCompleted =
    course.total_lectures > 0
      ? Math.round((pct / 100) * course.total_lectures)
      : null;

  const lastAccessedText = enrollment.last_accessed_at
    ? formatDistanceToNow(new Date(enrollment.last_accessed_at), { addSuffix: true })
    : 'Not started';

  return (
    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors duration-150 flex flex-col sm:flex-row">
      {/* Thumbnail */}
      <div className="relative sm:w-48 sm:flex-shrink-0 w-full h-40 sm:h-auto">
        <CourseThumbnail
          thumbnailUrl={course.thumbnail_url}
          title={course.title}
          categorySlug={category?.slug}
          categoryName={category?.name}
          aspectRatio="video"
          className="w-full h-full"
        />
        {/* Status badge overlay */}
        <div className="absolute top-2 left-2">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 bg-black/70 text-white text-[10px] font-semibold rounded-full px-2 py-0.5">
              <CheckCircle2 size={10} />
              Completed
            </span>
          ) : isNotStarted ? (
            <span className="inline-flex items-center bg-black/70 text-white text-[10px] font-semibold rounded-full px-2 py-0.5">
              Not started
            </span>
          ) : (
            <span className="inline-flex items-center bg-black/70 text-white text-[10px] font-semibold rounded-full px-2 py-0.5">
              {pct}%
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col min-w-0">
        {/* Top row: badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {categoryName && (
            <span className="bg-gray-100 text-gray-700 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
              {categoryName}
            </span>
          )}
          {course.difficulty && <DifficultyBadge difficulty={course.difficulty} />}
        </div>

        {/* Title */}
        <h3 className="mt-2 text-gray-900 font-semibold text-base line-clamp-2 leading-snug">
          {title}
        </h3>

        {/* Meta */}
        <div className="mt-1 mb-4 flex items-center gap-1 flex-wrap">
          {instructor?.full_name && (
            <>
              <UserCircle size={13} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-500 text-xs">{instructor.full_name}</span>
              <span className="text-gray-300 mx-1">·</span>
            </>
          )}
          <Clock size={13} className="text-gray-400 flex-shrink-0" />
          <span className="text-gray-500 text-xs">{lastAccessedText}</span>
        </div>

        {/* Progress */}
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-gray-900 text-sm font-semibold">{pct}% complete</span>
            {estimatedCompleted !== null && course.total_lectures > 0 && (
              <span className="text-gray-400 text-xs">
                ~{estimatedCompleted}/{course.total_lectures} lectures
              </span>
            )}
          </div>

          <CourseProgressBar percent={pct} size="md" />

          {isCompleted && enrollment.completed_at && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
              <span className="text-emerald-600 text-xs font-medium">
                Completed on {format(new Date(enrollment.completed_at), 'MMM d, yyyy')}
              </span>
            </div>
          )}

          {isNotStarted && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <PlayCircle size={13} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-400 text-xs">You haven't started this course yet</span>
            </div>
          )}
        </div>

        {/* Action row */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 flex-wrap">
          {isCompleted ? (
            <Link
              href={`/courses/${course.slug}`}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={14} />
              Review Course
            </Link>
          ) : (
            <Link
              href={`/courses/${course.slug}/learn`}
              className="inline-flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-900 transition-colors"
            >
              <Play size={14} />
              {isNotStarted ? 'Start Course' : 'Resume Course'}
            </Link>
          )}

          {isCompleted && certificate && (
            <CertificateButton certificate={certificate} />
          )}

          <Link
            href={`/courses/${course.slug}`}
            className="ml-auto text-gray-400 text-sm hover:text-gray-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
