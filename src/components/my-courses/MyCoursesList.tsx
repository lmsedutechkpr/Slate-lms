'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, PlayCircle, Trophy, SearchX } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Enrollment, Certificate } from '@/types';
import { MyCourseCard } from './MyCourseCard';

interface MyCourseListProps {
  initialEnrollments: Enrollment[];
  certificates: Record<string, Certificate>;
  lang: 'en' | 'ta';
  totalPages: number;
  currentPage: number;
  filter: string;
  search: string;
}

function EmptyState({ filter, search }: { filter: string; search: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function clearSearch() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }

  if (search) {
    return (
      <div className="py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SearchX size={24} className="text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-semibold text-base mb-1">No courses match "{search}"</h3>
        <p className="text-gray-500 text-sm mb-4">Try a different search term.</p>
        <button
          onClick={clearSearch}
          className="inline-flex items-center bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-900 transition-colors"
        >
          Clear Search
        </button>
      </div>
    );
  }

  if (filter === 'in-progress') {
    return (
      <div className="py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <PlayCircle size={24} className="text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-semibold text-base mb-1">No courses in progress</h3>
        <p className="text-gray-500 text-sm">Courses you've started will appear here.</p>
      </div>
    );
  }

  if (filter === 'completed') {
    return (
      <div className="py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy size={24} className="text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-semibold text-base mb-1">No completed courses yet</h3>
        <p className="text-gray-500 text-sm">Finish a course to earn your certificate and see it here.</p>
      </div>
    );
  }

  // 'all' — no enrollments
  return (
    <div className="py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <BookOpen size={24} className="text-gray-300" />
      </div>
      <h3 className="text-gray-900 font-semibold text-base mb-1">You haven't enrolled in any courses yet</h3>
      <p className="text-gray-500 text-sm mb-4">Browse our catalog and start your learning journey today.</p>
      <Link
        href="/courses"
        className="inline-flex items-center bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-900 transition-colors"
      >
        Browse Courses
      </Link>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`?${params.toString()}`);
  }

  // Build page numbers
  const pages: (number | '...')[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (currentPage <= 3) {
    pages.push(1, 2, 3, 4, 5, '...', totalPages);
  } else if (currentPage >= totalPages - 2) {
    pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ←
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="text-gray-400 px-1">...</span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p as number)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              p === currentPage
                ? 'bg-black text-white border-black border'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        →
      </button>
    </div>
  );
}

export function MyCoursesList({
  initialEnrollments,
  certificates,
  lang,
  totalPages,
  currentPage,
  filter,
  search,
}: MyCourseListProps) {
  const [enrollments] = useState(initialEnrollments);

  if (enrollments.length === 0) {
    return <EmptyState filter={filter} search={search} />;
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${filter}-${search}-${currentPage}`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="flex flex-col gap-4"
        >
          {enrollments.map((enrollment, i) => (
            <motion.div
              key={enrollment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18, delay: i * 0.06 }}
            >
              <MyCourseCard
                enrollment={enrollment}
                certificate={certificates[enrollment.course_id] ?? null}
                lang={lang}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
