'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { X } from 'lucide-react';

interface ActiveShopFiltersProps {
  search: string;
  category: string;
  categoryName?: string;
  minPrice: number;
  maxPrice: number;
  rating: number;
  inStockOnly: boolean;
}

export function ActiveShopFilters({
  search,
  category,
  categoryName,
  minPrice,
  maxPrice,
  rating,
  inStockOnly,
}: ActiveShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const remove = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      params.set('page', '1');
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  const pills: { label: string; key: string }[] = [];

  if (search) pills.push({ label: `"${search}"`, key: 'search' });
  if (category !== 'all') pills.push({ label: categoryName ?? category, key: 'category' });
  if (minPrice > 0 && maxPrice > 0)
    pills.push({ label: `₹${minPrice.toLocaleString('en-IN')} – ₹${maxPrice.toLocaleString('en-IN')}`, key: 'price' });
  else if (minPrice > 0) pills.push({ label: `Min ₹${minPrice.toLocaleString('en-IN')}`, key: 'minPrice' });
  else if (maxPrice > 0) pills.push({ label: `Under ₹${maxPrice.toLocaleString('en-IN')}`, key: 'maxPrice' });
  if (rating > 0) pills.push({ label: `${rating}+ stars`, key: 'rating' });
  if (inStockOnly) pills.push({ label: 'In Stock Only', key: 'inStock' });

  if (pills.length === 0) return null;

  const removePrice = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('minPrice');
    params.delete('maxPrice');
    params.set('page', '1');
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2 px-6 py-3">
      {pills.map((pill) => (
        <button
          key={pill.key}
          onClick={() => {
            if (pill.key === 'price') removePrice();
            else remove(pill.key);
          }}
          className="flex items-center gap-1.5 bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-medium hover:bg-gray-200 transition-colors"
        >
          {pill.label}
          <X size={11} className="text-gray-500" />
        </button>
      ))}
    </div>
  );
}
