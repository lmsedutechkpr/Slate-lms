'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

interface ShopSearchProps {
  defaultValue: string;
}

export function ShopSearch({ defaultValue }: ShopSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushSearch = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) {
        params.set('search', q);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => pushSearch(v), 350);
  };

  const handleClear = () => {
    setValue('');
    pushSearch('');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="relative flex-1">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search products, accessories..."
        className="w-full pl-9 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
