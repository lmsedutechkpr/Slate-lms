'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { EnrollmentCounts, MyCoursesFilter } from '@/lib/actions/my-courses';

interface MyCoursesFilterProps {
  counts: EnrollmentCounts;
  activeFilter: string;
}

const TABS: { key: MyCoursesFilter; label: string }[] = [
  { key: 'all', label: 'All Courses' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

function getCount(counts: EnrollmentCounts, key: MyCoursesFilter): number {
  if (key === 'all') return counts.all;
  if (key === 'in-progress') return counts.inProgress;
  if (key === 'completed') return counts.completed;
  return 0;
}

export function MyCoursesFilter({ counts, activeFilter }: MyCoursesFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleTab(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('filter', key);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 lg:px-8">
      <div className="flex gap-0 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          const count = getCount(counts, tab.key);
          return (
            <button
              key={tab.key}
              onClick={() => handleTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap cursor-pointer transition-colors',
                isActive
                  ? 'text-gray-900 font-semibold border-black'
                  : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
