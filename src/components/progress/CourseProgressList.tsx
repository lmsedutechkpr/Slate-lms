import { BookOpen, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Enrollment, Certificate, QuizAttempt } from '@/types';
import { CourseProgressCard } from './CourseProgressCard';

interface CourseProgressItem {
  enrollment: Enrollment;
  completedLectures: number;
  totalLectures: number;
  quizAttempts: QuizAttempt[];
  certificate: Certificate | null;
}

interface CourseProgressListProps {
  items: CourseProgressItem[];
  lang?: 'en' | 'ta';
}

export function CourseProgressList({ items, lang = 'en' }: CourseProgressListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
          <BarChart3 size={36} className="text-gray-300" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No progress yet</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-sm">
          Enroll in a course to start tracking your learning journey.
        </p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium rounded-xl px-6 py-3 hover:bg-gray-800 transition-colors"
        >
          <BookOpen size={16} />
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <CourseProgressCard key={item.enrollment.id} item={item} lang={lang} />
      ))}
    </div>
  );
}
