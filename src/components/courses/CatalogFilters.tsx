'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface ActiveFilters {
  difficulty: string[];
  language: string[];
  price: string;
  rating: number;
  duration: string;
}

interface CatalogFiltersProps {
  categories: Category[];
  categoryCounts: Record<string, number>;
  activeCategory: string;
  activeFilters: ActiveFilters;
}

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const PRICE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
];

const RATING_OPTIONS = [
  { value: 4.5, label: '4.5 & up' },
  { value: 4.0, label: '4.0 & up' },
  { value: 3.5, label: '3.5 & up' },
  { value: 3.0, label: '3.0 & up' },
];

const DURATION_OPTIONS = [
  { value: 'any', label: 'Any duration' },
  { value: '2h', label: 'Under 2 hours' },
  { value: '10h', label: 'Under 10 hours' },
  { value: '10h+', label: '10+ hours' },
];

const LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'both', label: 'English & Tamil' },
];

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 px-5 text-sm font-semibold text-gray-900 hover:text-black"
      >
        {title}
        {open ? (
          <ChevronUp size={14} className="text-gray-400" />
        ) : (
          <ChevronDown size={14} className="text-gray-400" />
        )}
      </button>
      {open && <div className="pb-4 px-5">{children}</div>}
    </div>
  );
}

export function CatalogFilters({
  categories,
  categoryCounts,
  activeCategory,
  activeFilters,
}: CatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === '' || value === 'all' || value === 'any' || value === '0') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set('page', '1');
    router.push(`/courses?${params.toString()}`);
  };

  const toggleMulti = (key: string, current: string[], val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const next = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    if (next.length === 0) {
      params.delete(key);
    } else {
      params.set(key, next.join(','));
    }
    params.set('page', '1');
    router.push(`/courses?${params.toString()}`);
  };

  const clearAll = () => {
    router.push('/courses');
  };

  const hasActiveFilters =
    activeCategory !== 'all' ||
    activeFilters.difficulty.length > 0 ||
    activeFilters.price !== 'all' ||
    activeFilters.rating > 0 ||
    activeFilters.duration !== 'any' ||
    activeFilters.language.length > 0;

  return (
    <div className="py-2">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Filters</span>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-900 transition-colors"
          >
            <RotateCcw size={11} />
            Clear
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <div className="space-y-1">
          <button
            onClick={() => updateParam('category', 'all')}
            className={cn(
              'flex items-center justify-between w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors',
              activeCategory === 'all'
                ? 'bg-gray-100 text-gray-900 font-semibold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            <span>All Courses</span>
          </button>
          {categories.map((cat) => {
            const count = categoryCounts[cat.id] ?? 0;
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => updateParam('category', cat.slug)}
                className={cn(
                  'flex items-center justify-between w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-gray-100 text-gray-900 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <span>{cat.name}</span>
                <span className="text-xs text-gray-400 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Difficulty */}
      <FilterSection title="Difficulty">
        <div className="space-y-2">
          {DIFFICULTY_OPTIONS.map((opt) => {
            const checked = activeFilters.difficulty.includes(opt.value);
            return (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    toggleMulti('difficulty', activeFilters.difficulty, opt.value)
                  }
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-black"
                />
                <span
                  className={cn(
                    'text-sm transition-colors',
                    checked ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'
                  )}
                >
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price">
        <div className="space-y-2">
          {PRICE_OPTIONS.map((opt) => {
            const checked = activeFilters.price === opt.value;
            return (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="price"
                  checked={checked}
                  onChange={() => updateParam('price', opt.value)}
                  className="w-3.5 h-3.5 border-gray-300 accent-black"
                />
                <span
                  className={cn(
                    'text-sm transition-colors',
                    checked ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'
                  )}
                >
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating">
        <div className="space-y-2">
          {RATING_OPTIONS.map((opt) => {
            const checked = activeFilters.rating === opt.value;
            return (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="rating"
                  checked={checked}
                  onChange={() =>
                    updateParam('rating', checked ? '0' : String(opt.value))
                  }
                  className="w-3.5 h-3.5 border-gray-300 accent-black"
                />
                <span
                  className={cn(
                    'text-sm transition-colors flex items-center gap-1',
                    checked ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'
                  )}
                >
                  <span className="text-amber-400">★</span>
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* Duration */}
      <FilterSection title="Duration">
        <div className="space-y-2">
          {DURATION_OPTIONS.map((opt) => {
            const checked = activeFilters.duration === opt.value;
            return (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="duration"
                  checked={checked}
                  onChange={() => updateParam('duration', opt.value)}
                  className="w-3.5 h-3.5 border-gray-300 accent-black"
                />
                <span
                  className={cn(
                    'text-sm transition-colors',
                    checked ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'
                  )}
                >
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* Language */}
      <FilterSection title="Language" defaultOpen={false}>
        <div className="space-y-2">
          {LANGUAGE_OPTIONS.map((opt) => {
            const checked = activeFilters.language.includes(opt.value);
            return (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    toggleMulti('language', activeFilters.language, opt.value)
                  }
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-black"
                />
                <span
                  className={cn(
                    'text-sm transition-colors',
                    checked ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'
                  )}
                >
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );
}
