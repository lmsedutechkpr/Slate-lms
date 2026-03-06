'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { ProductCategory } from '@/types';
import { getCategoryIcon } from './shopUtils';
import { cn } from '@/lib/utils';

interface ShopCategoryTabsProps {
  categories: ProductCategory[];
  activeCategory: string;
  counts: Record<string, number>;
}

export function ShopCategoryTabs({ categories, activeCategory, counts }: ShopCategoryTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setCategory = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('category', slug);
      params.set('page', '1');
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-3 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 min-w-max">
        {/* All Products tab */}
        <button
          onClick={() => setCategory('all')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap',
            activeCategory === 'all'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
          )}
        >
          All Products
          <span className={cn('text-xs', activeCategory === 'all' ? 'text-gray-300' : 'text-gray-400')}>
            {totalCount}
          </span>
        </button>

        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          const count = counts[cat.id] ?? 0;
          const isActive = activeCategory === cat.slug;

          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.slug)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                isActive
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              )}
            >
              <Icon size={13} />
              {cat.name}
              <span className={cn('text-xs', isActive ? 'text-gray-300' : 'text-gray-400')}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
