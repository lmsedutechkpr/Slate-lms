'use client';

import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce'; // Assuming this exists or I'll create it

export function CourseSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const debouncedQuery = useDebounce(query, 300);

  const updateSearch = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    router.push(`/courses?${params.toString()}`);
  }, [searchParams, router]);

  useEffect(() => {
    updateSearch(debouncedQuery);
  }, [debouncedQuery, updateSearch]);

  return (
    <div className="relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
      <Input
        type="text"
        placeholder="Search for courses, topics, or instructors..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-14 pl-12 pr-12 bg-white border-slate-100 focus:border-slate-900 focus:ring-0 rounded-2xl shadow-sm transition-all text-lg font-medium placeholder:text-slate-300"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
