'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Compass } from 'lucide-react';
import Link from 'next/link';
import { WishlistItem } from '@/types';
import { WishlistCourseCard } from './WishlistCourseCard';
import { removeFromWishlist } from '@/lib/actions/wishlist';
import { toast } from 'sonner';

interface WishlistGridProps {
  initialItems: WishlistItem[];
  enrolledIds: string[];
  studentId: string;
  lang: 'en' | 'ta';
}

type SortKey = 'recent' | 'price-low' | 'price-high' | 'rating' | 'title';

function sortItems(items: WishlistItem[], sortBy: SortKey): WishlistItem[] {
  const copy = [...items];
  switch (sortBy) {
    case 'price-low':
      return copy.sort((a, b) => (a.course?.price ?? 0) - (b.course?.price ?? 0));
    case 'price-high':
      return copy.sort((a, b) => (b.course?.price ?? 0) - (a.course?.price ?? 0));
    case 'rating':
      return copy.sort((a, b) => (b.course?.rating ?? 0) - (a.course?.rating ?? 0));
    case 'title':
      return copy.sort((a, b) =>
        (a.course?.title ?? '').localeCompare(b.course?.title ?? '')
      );
    default:
      return copy; // 'recent' – already in added_at desc order from server
  }
}

export function WishlistGrid({ initialItems, enrolledIds, studentId, lang }: WishlistGridProps) {
  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const [sortBy, setSortBy] = useState<SortKey>('recent');

  const sorted = sortItems(items, sortBy);

  const handleRemove = async (courseId: string) => {
    const removed = items.find((i) => i.course_id === courseId);
    setItems((prev) => prev.filter((i) => i.course_id !== courseId));

    const result = await removeFromWishlist(courseId, studentId);
    if (!result.success) {
      if (removed) setItems((prev) => [removed, ...prev]);
      toast.error('Failed to remove course. Please try again.');
    }
  };

  return (
    <div>
      {/* Sort / count row */}
      <div className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between -mx-4 lg:-mx-8 -mt-4 lg:-mt-8 mb-8">
        <span className="text-gray-500 text-sm">
          {items.length} course{items.length !== 1 ? 's' : ''}
        </span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-gray-400"
        >
          <option value="recent">Recently Added</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="title">Course Title</option>
        </select>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={28} className="text-gray-300" />
          </div>
          <h3 className="text-gray-900 font-semibold text-lg">Your wishlist is empty</h3>
          <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
            Save courses you&apos;re interested in and come back to them anytime.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-black text-white rounded-lg px-5 py-2.5 text-sm font-semibold mt-4"
          >
            <Compass size={14} />
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {sorted.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, height: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <WishlistCourseCard
                  item={item}
                  isEnrolled={enrolledIds.includes(item.course_id)}
                  onRemove={() => handleRemove(item.course_id)}
                  lang={lang}
                  studentId={studentId}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
