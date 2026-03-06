import { ProductReview, ReviewStats } from '@/types';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ProductReviewsProps {
  reviews: ProductReview[];
  stats: ReviewStats;
}

export function ProductReviews({ reviews, stats }: ProductReviewsProps) {
  if (stats.total === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-gray-900 font-bold text-xl mb-6">Customer Reviews</h2>

      {/* Overview */}
      <div className="flex gap-8 mb-8 p-5 bg-gray-50 rounded-xl border border-gray-200">
        <div className="text-center flex-shrink-0">
          <p className="text-5xl font-bold text-gray-900">{stats.average.toFixed(1)}</p>
          <div className="flex justify-center mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={14}
                className={cn(
                  i <= Math.round(stats.average)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200 fill-gray-200'
                )}
              />
            ))}
          </div>
          <p className="text-gray-400 text-xs mt-1">{stats.total} reviews</p>
        </div>

        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.breakdown[star as keyof typeof stats.breakdown] ?? 0;
            const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500 w-4 text-right">{star}</span>
                <Star size={10} className="text-amber-400 fill-amber-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-6">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review list */}
      <div className="space-y-4">
        {reviews.slice(0, 5).map((review) => (
          <div key={review.id} className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-gray-600">
                {review.student?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-gray-900 text-sm font-medium">{review.student?.full_name ?? 'User'}</p>
                  <span className="text-gray-400 text-xs flex-shrink-0">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex mt-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={11}
                      className={cn(
                        i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
            {review.comment && (
              <p className="text-gray-600 text-sm ml-11">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
