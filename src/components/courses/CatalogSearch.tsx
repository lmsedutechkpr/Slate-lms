'use client';

import { Search, X, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

interface CatalogSearchProps {
  defaultValue?: string;
}

export function CatalogSearch({ defaultValue = '' }: CatalogSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(defaultValue);
  const [pending, setPending] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  const updateSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('search', value.trim());
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      router.push(`/courses?${params.toString()}`);
      setPending(false);
    },
    [searchParams, router]
  );

  useEffect(() => {
    updateSearch(debouncedQuery);
  }, [debouncedQuery, updateSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPending(true);
  };

  const handleClear = () => {
    setQuery('');
    setPending(false);
  };

  return (
    <div className="relative mb-5">
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search courses..."
        className="w-full h-10 pl-9 pr-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {pending ? (
          <Loader2 size={14} className="animate-spin text-gray-400" />
        ) : query ? (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
