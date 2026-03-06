'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { LayoutGrid, List, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

interface ShopSortProps {
  sort: string;
  view: string;
}

export function ShopSort({ sort, view }: ShopSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, val: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, val);
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex items-center gap-3">
      {/* Sort dropdown */}
      <div className="relative">
        <select
          value={sort}
          onChange={(e) => update('sort', e.target.value)}
          className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 cursor-pointer focus:outline-none focus:border-gray-900"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      {/* View toggle */}
      <div className="flex border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => update('view', 'grid')}
          className={cn(
            'p-2 transition-colors',
            view === 'grid' ? 'bg-black text-white' : 'bg-white text-gray-400 hover:text-gray-700'
          )}
        >
          <LayoutGrid size={15} />
        </button>
        <button
          onClick={() => update('view', 'list')}
          className={cn(
            'p-2 transition-colors',
            view === 'list' ? 'bg-black text-white' : 'bg-white text-gray-400 hover:text-gray-700'
          )}
        >
          <List size={15} />
        </button>
      </div>
    </div>
  );
}
