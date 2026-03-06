import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: number;
}

export function StarRating({ rating, size = 'md', showCount }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const starSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const starClass = cn('fill-amber-400 text-amber-400', starSizes[size]);
  const emptyStarClass = cn('text-slate-300', starSizes[size]);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className={starClass} />
        ))}
        {hasHalfStar && <StarHalf className={starClass} />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className={emptyStarClass} />
        ))}
      </div>
      <span className={cn(
        "font-medium text-slate-700",
        size === 'sm' ? 'text-xs' : 'text-sm'
      )}>
        {rating.toFixed(1)}
      </span>
      {showCount !== undefined && (
        <span className={cn(
          "text-slate-400",
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
          ({showCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
