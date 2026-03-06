import { Profile } from '@/types';
import { Star, Users, BookOpen } from 'lucide-react';

interface CourseInstructorProps {
  instructor: Profile;
}

export function CourseInstructor({ instructor }: CourseInstructorProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-5">Your Instructor</h2>
      <div className="border border-gray-200 rounded-xl p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xl flex-shrink-0 overflow-hidden">
            {instructor.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={instructor.avatar_url}
                alt={instructor.full_name ?? ''}
                className="w-full h-full object-cover"
              />
            ) : (
              instructor.full_name?.charAt(0) ?? 'I'
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
              {instructor.full_name ?? 'Instructor'}
            </h3>
            <p className="text-sm text-gray-500">Expert Educator</p>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span>4.9 Instructor Rating</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Users size={13} className="text-gray-400" />
                <span>24,532 Students</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <BookOpen size={13} className="text-gray-400" />
                <span>12 Courses</span>
              </div>
            </div>
          </div>
        </div>
        {instructor.bio && (
          <p className="text-sm text-gray-600 leading-relaxed">{instructor.bio}</p>
        )}
        {!instructor.bio && (
          <p className="text-sm text-gray-500 leading-relaxed">
            Passionate educator dedicated to empowering students with practical skills for the modern
            world.
          </p>
        )}
      </div>
    </div>
  );
}
