'use client';

import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { ProductListItem } from './ProductListItem';
import { ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface ProductGridProps {
  products: Product[];
  view: 'grid' | 'list';
  lang?: 'en' | 'ta';
  studentId?: string;
  search?: string;
  category?: string;
  relevantCategories?: Set<string>;
}

export function ProductGrid({
  products,
  view,
  lang = 'en',
  studentId,
  search,
  category,
  relevantCategories = new Set(),
}: ProductGridProps) {
  const router = useRouter();

  const clearFilters = useCallback(() => {
    router.push('/shop');
  }, [router]);

  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag size={28} className="text-gray-300" />
        </div>
        <p className="text-gray-900 font-semibold text-lg">No products found</p>
        <p className="text-gray-400 text-sm mt-1">
          {search
            ? `No results for "${search}"`
            : category && category !== 'all'
            ? 'No products in this category yet'
            : 'No products match your filters'}
        </p>
        <button
          onClick={clearFilters}
          className="mt-5 bg-black text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  if (view === 'list') {
    return (
      <div className="flex flex-col gap-3">
        {products.map((p) => (
          <ProductListItem
            key={p.id}
            product={p}
            lang={lang}
            studentId={studentId}
            relevantCategories={relevantCategories}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          lang={lang}
          studentId={studentId}
          relevantCategories={relevantCategories}
        />
      ))}
    </div>
  );
}
