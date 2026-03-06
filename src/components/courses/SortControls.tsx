'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortControlsProps {
  sort: string;
  view: 'grid' | 'list';
}

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'price-low', label: 'Price: Low to high' },
  { value: 'price-high', label: 'Price: High to low' },
];

export function SortControls({ sort, view }: SortControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set('page', '1');
    router.push(`/courses?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Sort Select */}
      <select
        value={sort}
        onChange={(e) => updateParam('sort', e.target.value)}
        className="h-9 pl-3 pr-8 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-gray-400 appearance-none cursor-pointer hover:border-gray-300 transition-colors"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
        }}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* View Toggle */}
      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => updateParam('view', 'grid')}
          className={cn(
            'flex items-center justify-center w-9 h-9 transition-colors',
            view === 'grid'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-50'
          )}
          title="Grid view"
        >
          <LayoutGrid size={15} />
        </button>
        <button
          onClick={() => updateParam('view', 'list')}
          className={cn(
            'flex items-center justify-center w-9 h-9 transition-colors border-l border-gray-200',
            view === 'list'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-50'
          )}
          title="List view"
        >
          <List size={15} />
        </button>
      </div>
    </div>
  );
}
