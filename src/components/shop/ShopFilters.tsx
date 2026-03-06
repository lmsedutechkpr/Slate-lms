'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { ProductCategory } from '@/types';
import { getCategoryIcon } from './shopUtils';
import { cn } from '@/lib/utils';

interface ShopFiltersProps {
  categories: ProductCategory[];
  categoryCounts: Record<string, number>;
  activeFilters: {
    category: string;
    minPrice: number;
    maxPrice: number;
    rating: number;
    inStockOnly: boolean;
  };
}

const PRICE_PRESETS = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500–₹2000', min: 500, max: 2000 },
  { label: '₹2000–₹10000', min: 2000, max: 10000 },
  { label: '₹10000+', min: 10000, max: 0 },
];

const RATING_OPTIONS = [
  { label: 'Any rating', value: 0 },
  { label: '3.5+', value: 3.5 },
  { label: '4.0+', value: 4.0 },
  { label: '4.5+', value: 4.5 },
];

export function ShopFilters({ categories, categoryCounts, activeFilters }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(activeFilters.minPrice > 0 ? String(activeFilters.minPrice) : '');
  const [maxPrice, setMaxPrice] = useState(activeFilters.maxPrice > 0 ? String(activeFilters.maxPrice) : '');
  const priceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === '' || v === '0' || v === 'false' || v === 'all') {
          params.delete(k);
        } else {
          params.set(k, v);
        }
      });
      params.set('page', '1');
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  const hasActiveFilters =
    activeFilters.category !== 'all' ||
    activeFilters.minPrice > 0 ||
    activeFilters.maxPrice > 0 ||
    activeFilters.rating > 0 ||
    activeFilters.inStockOnly;

  const clearAll = () => {
    setMinPrice('');
    setMaxPrice('');
    router.push('/shop');
  };

  const handlePriceChange = (type: 'min' | 'max', val: string) => {
    if (type === 'min') setMinPrice(val);
    else setMaxPrice(val);

    if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
    priceTimerRef.current = setTimeout(() => {
      const min = type === 'min' ? val : minPrice;
      const max = type === 'max' ? val : maxPrice;
      updateParams({ minPrice: min || '0', maxPrice: max || '0' });
    }, 500);
  };

  const applyPreset = (preset: { min: number; max: number }) => {
    setMinPrice(preset.min > 0 ? String(preset.min) : '');
    setMaxPrice(preset.max > 0 ? String(preset.max) : '');
    updateParams({ minPrice: String(preset.min), maxPrice: String(preset.max) });
  };

  const isPresetActive = (preset: { min: number; max: number }) =>
    activeFilters.minPrice === preset.min && activeFilters.maxPrice === preset.max;

  useEffect(() => {
    return () => {
      if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
    };
  }, []);

  const totalCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-gray-600" />
          <span className="text-gray-900 font-semibold text-sm">Filters</span>
        </div>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div className="p-4 border-b border-gray-100">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Category</p>

        {/* All Products */}
        <button
          onClick={() => updateParams({ category: 'all' })}
          className={cn(
            'flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm transition-colors mb-0.5',
            activeFilters.category === 'all'
              ? 'bg-gray-100 text-gray-900 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
          )}
        >
          <span
            className={cn(
              'w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
              activeFilters.category === 'all' ? 'border-black bg-black' : 'border-gray-300'
            )}
          >
            {activeFilters.category === 'all' && (
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </span>
          <span className="flex-1 text-left">All Products</span>
          <span className="text-xs text-gray-400">{totalCount}</span>
        </button>

        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          const isActive = activeFilters.category === cat.slug;
          const count = categoryCounts[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              onClick={() => updateParams({ category: cat.slug })}
              className={cn(
                'flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm transition-colors mb-0.5',
                isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <span
                className={cn(
                  'w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                  isActive ? 'border-black bg-black' : 'border-gray-300'
                )}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
              <Icon size={14} className="text-gray-400 flex-shrink-0" />
              <span className="flex-1 text-left">{cat.name}</span>
              <span className="text-xs text-gray-400">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Price Range */}
      <div className="p-4 border-b border-gray-100">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Price Range</p>

        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="text-[10px] text-gray-400 mb-1 block">Min ₹</label>
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              placeholder="0"
              className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-gray-400 mb-1 block">Max ₹</label>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              placeholder="Any"
              className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PRICE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs cursor-pointer transition-colors',
                isPresetActive(preset)
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="p-4 border-b border-gray-100">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Minimum Rating</p>

        {RATING_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateParams({ rating: String(opt.value) })}
            className={cn(
              'flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm transition-colors mb-0.5',
              activeFilters.rating === opt.value
                ? 'bg-gray-100 font-medium text-gray-900'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            {opt.value === 0 ? (
              <span className="text-sm">Any rating</span>
            ) : (
              <>
                <span className="text-amber-400 text-sm">{'★'.repeat(Math.floor(opt.value))}</span>
                <span className="text-sm">{opt.value}+</span>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Availability */}
      <div className="p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Availability</p>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={activeFilters.inStockOnly}
            onChange={(e) => updateParams({ inStock: String(e.target.checked) })}
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
          />
          <span className="text-gray-700 text-sm">In Stock Only</span>
        </label>
      </div>
    </div>
  );
}
