'use client';

import { 
  Filter,
} from 'lucide-react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Category } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CourseFiltersProps {
  categories: Category[];
}

export function CourseFilters({ categories }: CourseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>('all');

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) setSelectedCategories(categoryParam.split(','));

    const difficultyParam = searchParams.get('difficulty');
    if (difficultyParam) setSelectedDifficulty(difficultyParam.split(','));

    const languageParam = searchParams.get('language');
    if (languageParam) setSelectedLanguage(languageParam.split(','));

    const priceParam = searchParams.get('price');
    if (priceParam) setPriceRange(priceParam);
  }, [searchParams]);

  const updateFilters = (key: string, values: string[] | string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (Array.isArray(values)) {
      if (values.length > 0) params.set(key, values.join(','));
      else params.delete(key);
    } else {
      if (values && values !== 'all') params.set(key, values);
      else params.delete(key);
    }
    params.set('page', '1');
    router.push(`/courses?${params.toString()}`);
  };

  const handleToggle = (key: string, value: string, current: string[], setter: any) => {
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setter(next);
    updateFilters(key, next);
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedDifficulty([]);
    setSelectedLanguage([]);
    setPriceRange('all');
    router.push('/courses');
  };

  return (
    <div className="space-y-6 sticky top-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-700" />
          <h3 className="font-medium text-gray-900">Filters</h3>
        </div>
        <button
          onClick={clearAll}
          className="text-xs font-normal text-gray-500 underline hover:text-gray-900 transition-colors"
        >
          Clear all
        </button>
      </div>

      <Accordion type="multiple" defaultValue={['category', 'difficulty', 'language', 'price']} className="w-full">
        {/* Category */}
        <AccordionItem value="category" className="border-gray-100">
          <AccordionTrigger className="hover:no-underline py-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Category</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleToggle('category', cat.slug, selectedCategories, setSelectedCategories)}>
                  <Checkbox
                    checked={selectedCategories.includes(cat.slug)}
                    className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black rounded"
                  />
                  <span className="text-sm font-normal text-gray-600 group-hover:text-gray-900 transition-colors">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Difficulty */}
        <AccordionItem value="difficulty" className="border-gray-100">
          <AccordionTrigger className="hover:no-underline py-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Difficulty</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              {['beginner', 'intermediate', 'advanced'].map((level) => (
                <div key={level} className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleToggle('difficulty', level, selectedDifficulty, setSelectedDifficulty)}>
                  <Checkbox
                    checked={selectedDifficulty.includes(level)}
                    className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black rounded"
                  />
                  <span className="text-sm font-normal text-gray-600 group-hover:text-gray-900 transition-colors capitalize">
                    {level}
                  </span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Language */}
        <AccordionItem value="language" className="border-gray-100">
          <AccordionTrigger className="hover:no-underline py-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Language</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
                {[
                  { label: 'English', value: 'english' },
                  { label: 'Tamil', value: 'tamil' },
                  { label: 'Both', value: 'both' }
                ].map((lang) => (
                <div key={lang.value} className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleToggle('language', lang.value, selectedLanguage, setSelectedLanguage)}>
                  <Checkbox
                    checked={selectedLanguage.includes(lang.value)}
                    className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black rounded"
                  />
                  <span className="text-sm font-normal text-gray-600 group-hover:text-gray-900 transition-colors">
                    {lang.label}
                  </span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price */}
        <AccordionItem value="price" className="border-gray-100">
          <AccordionTrigger className="hover:no-underline py-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Price</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              {[
                { label: 'All', value: 'all' },
                { label: 'Free', value: 'free' },
                { label: 'Paid', value: 'paid' }
              ].map((p) => (
                <div key={p.value} className="flex items-center space-x-3 group cursor-pointer" onClick={() => {
                  setPriceRange(p.value);
                  updateFilters('price', p.value);
                }}>
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                    priceRange === p.value ? "border-black bg-black" : "border-gray-300 bg-white"
                  )}>
                    {priceRange === p.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm font-normal text-gray-600 group-hover:text-gray-900 transition-colors">
                    {p.label}
                  </span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
