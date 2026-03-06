'use client';

import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { toggleWishlist } from '@/lib/actions/enrollments';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  courseId: string;
  isWishlisted: boolean;
  size?: 'sm' | 'md';
  variant?: 'overlay' | 'standalone';
}

export function WishlistButton({
  courseId,
  isWishlisted: initialWishlisted,
  size = 'sm',
  variant = 'overlay',
}: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    const prev = wishlisted;
    setWishlisted(!prev); // optimistic

    try {
      const result = await toggleWishlist(courseId);
      setWishlisted(result.wishlisted);
      toast.success(result.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (err: any) {
      setWishlisted(prev); // revert
      if (err?.message?.includes('Not authenticated')) {
        router.push('/login');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === 'sm' ? 14 : 16;

  if (variant === 'overlay') {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
      >
        {loading ? (
          <Loader2 size={iconSize} className="animate-spin text-gray-400" />
        ) : (
          <Heart
            size={iconSize}
            className={cn(
              'transition-colors',
              wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'
            )}
          />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={cn(
        'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:border-gray-400 hover:text-gray-900 transition-colors',
        loading && 'opacity-50 cursor-not-allowed'
      )}
    >
      {loading ? (
        <Loader2 size={iconSize} className="animate-spin text-gray-400" />
      ) : (
        <Heart
          size={iconSize}
          className={cn(wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-500')}
        />
      )}
      {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
    </button>
  );
}
