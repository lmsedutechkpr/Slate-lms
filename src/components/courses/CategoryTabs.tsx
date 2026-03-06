'use client';

import { Category } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  counts: Record<string, number>;
}

export function CategoryTabs({ categories, activeCategory, counts }: CategoryTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    params.set('page', '1');
    router.push(`/courses?${params.toString()}`);
  };

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  const tabs = [
    { slug: 'all', name: 'All', count: totalCount },
    ...categories.map((cat) => ({
      slug: cat.slug,
      name: cat.name,
      count: counts[cat.id] ?? 0,
    })),
  ];

  return (
    <div className="border-b border-gray-200 bg-white px-6 lg:px-8">
      <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide -mb-px">
        {tabs.map((tab) => {
          const isActive = activeCategory === tab.slug;
          return (
            <button
              key={tab.slug}
              onClick={() => handleChange(tab.slug)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                isActive
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.name}
              <span
                className={cn(
                  'text-[11px] font-normal tabular-nums',
                  isActive ? 'text-gray-500' : 'text-gray-400'
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
