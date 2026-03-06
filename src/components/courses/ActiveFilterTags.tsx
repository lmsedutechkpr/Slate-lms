'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { Category } from '@/types';

interface ActiveFilterTagsProps {
  search: string;
  category: string;
  categories: Category[];
  difficulty: string[];
  price: string;
  rating: number;
  duration: string;
  language: string[];
}

const DURATION_LABELS: Record<string, string> = {
  '2h': 'Under 2h',
  '10h': 'Under 10h',
  '10h+': '10h+',
};

const LANGUAGE_LABELS: Record<string, string> = {
  english: 'English',
  tamil: 'Tamil',
  both: 'English & Tamil',
};

export function ActiveFilterTags({
  search,
  category,
  categories,
  difficulty,
  price,
  rating,
  duration,
  language,
}: ActiveFilterTagsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const removeParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && (key === 'difficulty' || key === 'language')) {
      const current = (params.get(key) ?? '').split(',').filter(Boolean);
      const next = current.filter((v) => v !== value);
      if (next.length === 0) {
        params.delete(key);
      } else {
        params.set(key, next.join(','));
      }
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/courses?${params.toString()}`);
  };

  const categoryName =
    category !== 'all'
      ? categories.find((c) => c.slug === category)?.name ?? category
      : null;

  const tags: { label: string; onRemove: () => void }[] = [];

  if (search) {
    tags.push({ label: `"${search}"`, onRemove: () => removeParam('search') });
  }
  if (categoryName) {
    tags.push({ label: categoryName, onRemove: () => removeParam('category') });
  }
  difficulty.forEach((d) => {
    tags.push({
      label: d.charAt(0).toUpperCase() + d.slice(1),
      onRemove: () => removeParam('difficulty', d),
    });
  });
  if (price !== 'all') {
    tags.push({
      label: price.charAt(0).toUpperCase() + price.slice(1),
      onRemove: () => removeParam('price'),
    });
  }
  if (rating > 0) {
    tags.push({ label: `${rating}+ stars`, onRemove: () => removeParam('rating') });
  }
  if (duration !== 'any') {
    tags.push({
      label: DURATION_LABELS[duration] ?? duration,
      onRemove: () => removeParam('duration'),
    });
  }
  language.forEach((l) => {
    tags.push({
      label: LANGUAGE_LABELS[l] ?? l,
      onRemove: () => removeParam('language', l),
    });
  });

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {tags.map((tag, i) => (
        <button
          key={i}
          onClick={tag.onRemove}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors group"
        >
          {tag.label}
          <X size={11} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
        </button>
      ))}
      <button
        onClick={() => router.push('/courses')}
        className="text-xs text-gray-400 hover:text-gray-700 underline transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
