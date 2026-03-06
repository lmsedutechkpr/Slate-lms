'use client';

import { Course } from '@/types';
import { StarRating } from '@/components/shared/StarRating';
import { Users, Globe, BookOpen, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CourseDetailHeroProps {
  course: Course;
  reviewTotal: number;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700',
  intermediate: 'bg-amber-50 text-amber-700',
  advanced: 'bg-rose-50 text-rose-700',
};

const LANGUAGE_LABEL: Record<string, string> = {
  english: 'English',
  tamil: 'Tamil',
  both: 'English & Tamil',
};

export function CourseDetailHero({ course, reviewTotal }: CourseDetailHeroProps) {
  const durationHours = Math.floor((course.duration_minutes || 0) / 60);
  const durationMins = (course.duration_minutes || 0) % 60;
  const durationStr =
    durationHours > 0
      ? `${durationHours}h${durationMins > 0 ? ` ${durationMins}m` : ''}`
      : `${durationMins}m`;

  const category = Array.isArray(course.category) ? course.category[0] : course.category;
  const instructor = Array.isArray(course.instructor) ? course.instructor[0] : course.instructor;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-5">
        <Link href="/courses" className="hover:text-gray-700 transition-colors">
          Courses
        </Link>
        <ChevronRight size={13} />
        {category && (
          <>
            <Link
              href={`/courses?category=${category.slug}`}
              className="hover:text-gray-700 transition-colors"
            >
              {category.name}
            </Link>
            <ChevronRight size={13} />
          </>
        )}
        <span className="text-gray-600 font-medium line-clamp-1">{course.title}</span>
      </nav>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {category?.name && (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
            {category.name}
          </span>
        )}
        <span
          className={cn(
            'px-2.5 py-1 text-xs font-semibold rounded-full',
            DIFFICULTY_STYLES[course.difficulty] || 'bg-gray-100 text-gray-600'
          )}
        >
          {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
        </span>
        {course.is_featured && (
          <span className="px-2.5 py-1 bg-black text-white text-xs font-semibold rounded-full">
            Featured
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-3">
        {course.title}
      </h1>

      {/* Description */}
      {course.description && (
        <p className="text-gray-500 text-base leading-relaxed mb-5 max-w-2xl">
          {course.description}
        </p>
      )}

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-4 mb-5">
        {(course.rating ?? 0) > 0 && (
          <StarRating
            rating={course.rating ?? 0}
            size="md"
            showCount={reviewTotal || (course.rating_count ?? 0)}
          />
        )}
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Users size={14} className="text-gray-400" />
          <span>{(course.enrollment_count ?? 0).toLocaleString()} students</span>
        </div>
        {durationStr && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock size={14} className="text-gray-400" />
            <span>{durationStr}</span>
          </div>
        )}
        {(course.total_lectures ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <BookOpen size={14} className="text-gray-400" />
            <span>{course.total_lectures} lectures</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Globe size={14} className="text-gray-400" />
          <span>{LANGUAGE_LABEL[course.language] ?? course.language}</span>
        </div>
      </div>

      {/* Instructor */}
      {instructor && (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm flex-shrink-0 overflow-hidden">
            {instructor.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={instructor.avatar_url}
                alt={instructor.full_name ?? ''}
                className="w-full h-full object-cover"
              />
            ) : (
              (instructor.full_name?.charAt(0) ?? 'I')
            )}
          </div>
          <div>
            <span className="text-xs text-gray-400">Instructor: </span>
            <span className="text-sm font-medium text-gray-900">
              {instructor.full_name ?? 'Anonymous'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
