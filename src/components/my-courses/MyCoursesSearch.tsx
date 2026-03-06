'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useRef, useEffect, useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface MyCoursesSearchProps {
  defaultValue: string;
}

export function MyCoursesSearch({ defaultValue }: MyCoursesSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  function updateSearch(val: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (val.trim()) {
        params.set('search', val.trim());
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    }, 400);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    updateSearch(e.target.value);
  }

  function handleClear() {
    setValue('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.set('page', '1');
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }

  return (
    <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 focus-within:border-gray-900 focus-within:ring-2 focus-within:ring-black/5 transition-all">
      {isPending ? (
        <Loader2 size={15} className="text-gray-400 animate-spin flex-shrink-0" />
      ) : (
        <Search size={15} className="text-gray-400 flex-shrink-0" />
      )}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search your courses..."
        className="flex-1 py-2.5 text-sm outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
      />
      {value && (
        <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
