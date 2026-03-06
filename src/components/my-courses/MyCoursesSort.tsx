'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MyCoursesSortOption } from '@/lib/actions/my-courses';

interface MyCoursesSortProps {
  defaultValue: string;
}

const SORT_OPTIONS: { value: MyCoursesSortOption; label: string }[] = [
  { value: 'recent', label: 'Last Accessed' },
  { value: 'progress', label: 'Most Progress' },
  { value: 'enrolled', label: 'Date Enrolled' },
  { value: 'title', label: 'Course Title' },
];

export function MyCoursesSort({ defaultValue }: MyCoursesSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = SORT_OPTIONS.find((o) => o.value === defaultValue) ?? SORT_OPTIONS[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(val: MyCoursesSortOption) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', val);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap"
      >
        <ArrowUpDown size={14} className="text-gray-400" />
        <span>Sort: {current.label}</span>
        <ChevronDown size={14} className={cn('text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={cn(
                'w-full text-left px-3 py-2 text-sm transition-colors',
                opt.value === defaultValue
                  ? 'bg-gray-50 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
