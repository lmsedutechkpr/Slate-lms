'use client';

import { Course } from '@/types';
import { CourseCard } from '@/components/courses/CourseCard';
import { CourseListItem } from '@/components/courses/CourseListItem';

interface CourseGridProps {
  courses: Course[];
  enrolledIds?: string[];
  wishlistedIds?: string[];
  view?: 'grid' | 'list';
  showProgress?: boolean;
}

export function CourseGrid({
  courses,
  enrolledIds = [],
  wishlistedIds = [],
  view = 'grid',
  showProgress = false,
}: CourseGridProps) {
  if (view === 'list') {
    return (
      <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden mb-2">
        {courses.map((course) => (
          <CourseListItem
            key={course.id}
            course={course}
            isEnrolled={enrolledIds.includes(course.id)}
            isWishlisted={wishlistedIds.includes(course.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 mb-2">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          isEnrolled={enrolledIds.includes(course.id)}
          isWishlisted={wishlistedIds.includes(course.id)}
          showProgress={showProgress}
          className="h-full"
        />
      ))}
    </div>
  );
}
