import Link from 'next/link';
import { Course } from '@/types';
import { Sparkles, Heart } from 'lucide-react';
import { CourseThumbnail } from '@/components/shared/CourseThumbnail';
import { DifficultyBadge } from '@/components/shared/DifficultyBadge';
import { StarRating } from '@/components/shared/StarRating';

interface RecommendedCoursesProps {
  courses: Course[];
  interests: string[];
}

export function RecommendedCourses({ courses, interests }: RecommendedCoursesProps) {
  if (courses.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium uppercase tracking-widest">
              Personalized For You
            </span>
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">
            Recommended for You
          </h2>
          {interests.length > 0 && (
            <p className="text-gray-400 font-normal text-sm">
              Based on your interests
            </p>
          )}
        </div>
        <Link
          href="/courses"
          className="text-xs font-medium uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors whitespace-nowrap mt-1"
        >
          Browse All
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
        {courses.slice(0, 4).map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.slug}`}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all duration-150 flex flex-col group"
          >
            {/* Thumbnail - aspect-video */}
            <div className="relative w-full aspect-video">
              <CourseThumbnail course={course} />
              
              {/* Category + difficulty badges overlay */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="bg-gray-900/80 text-white text-[10px] font-semibold rounded-full px-2 py-0.5">
                  {(Array.isArray(course.category) ? course.category[0] : course.category)?.name}
                </span>
                <DifficultyBadge difficulty={course.difficulty} />
              </div>
              
              {/* Wishlist heart */}
              <button className="absolute top-2.5 right-2.5 p-1.5 bg-white/80 rounded-full hover:bg-white transition-all duration-150 z-20">
                <Heart className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
            
            {/* Card body */}
            <div className="p-4 flex flex-col flex-1">
              
              {/* Title */}
              <h3 className="text-gray-900 font-semibold text-sm line-clamp-2 leading-snug mb-2 group-hover:text-black">
                {course.title}
              </h3>
              
              {/* Rating */}
              {(course.rating ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 mb-3">
                  <StarRating rating={course.rating ?? 0} size="sm" />
                  {/* Note: StarRating already renders rating and count, but following requested structure */}
                  {/* If StarRating is too noisy, we might need a simpler version or just use it as is */}
                </div>
              )}
              
              {/* Price — mt-auto keeps it at bottom */}
              <div className="mt-auto pt-3 border-t border-gray-100">
                {course.price === 0 ? (
                  <span className="bg-emerald-100 text-emerald-700 rounded-full px-2.5 py-1 text-xs font-semibold">
                    Free
                  </span>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-900 font-bold text-sm">
                      ₹{course.price.toLocaleString('en-IN')}
                    </span>

                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
