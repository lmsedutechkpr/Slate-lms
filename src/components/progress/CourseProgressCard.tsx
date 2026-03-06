'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PlayCircle, CheckCircle2, Award } from 'lucide-react';
import { Enrollment, Certificate, QuizAttempt } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface CourseProgressItem {
  enrollment: Enrollment;
  completedLectures: number;
  totalLectures: number;
  quizAttempts: QuizAttempt[];
  certificate: Certificate | null;
}

interface CourseProgressCardProps {
  item: CourseProgressItem;
  lang?: 'en' | 'ta';
}

export function CourseProgressCard({ item, lang = 'en' }: CourseProgressCardProps) {
  const { enrollment, completedLectures, totalLectures, certificate } = item;
  const course = enrollment.course;
  if (!course) return null;

  const pct = enrollment.progress_percent ?? 0;
  const title = lang === 'ta' && course.title_ta ? course.title_ta : course.title;

  const hours = Math.floor((course.duration_minutes ?? 0) / 60);
  const mins = (course.duration_minutes ?? 0) % 60;
  const duration = hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins}m`;

  const statusLabel = pct === 100 ? 'Completed' : pct > 0 ? 'In Progress' : 'Not Started';
  const statusColor =
    pct === 100
      ? 'text-emerald-600 bg-emerald-50'
      : pct > 0
      ? 'text-amber-600 bg-amber-50'
      : 'text-gray-400 bg-gray-100';
  const barColor = pct === 100 ? 'bg-emerald-500' : 'bg-black';

  const lastAccessed = enrollment.last_accessed_at
    ? formatDistanceToNow(new Date(enrollment.last_accessed_at), { addSuffix: true })
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
      {/* Thumbnail */}
      <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl font-black text-gray-200 select-none">S</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-2">
          <Link
            href={`/courses/${course.slug}`}
            className="font-semibold text-gray-900 text-sm line-clamp-1 hover:text-black transition-colors"
          >
            {title}
          </Link>
          <div className="flex items-center gap-2 flex-shrink-0">
            {certificate && (
              <span title="Certificate earned" className="text-amber-500">
                <Award size={14} />
              </span>
            )}
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-600 flex-shrink-0 w-8 text-right">
            {pct}%
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          {totalLectures > 0 && (
            <span>
              {completedLectures}/{totalLectures} lectures
            </span>
          )}
          {course.duration_minutes > 0 && <span>{duration}</span>}
          {course.category && <span>{(Array.isArray(course.category) ? course.category[0] : course.category).name}</span>}
          {lastAccessed && <span>· {lastAccessed}</span>}
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/courses/${course.slug}/learn`}
        className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-black bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
      >
        {pct === 100 ? (
          <>
            <CheckCircle2 size={13} />
            Review
          </>
        ) : (
          <>
            <PlayCircle size={13} />
            {pct === 0 ? 'Start' : 'Continue'}
          </>
        )}
      </Link>
    </div>
  );
}
