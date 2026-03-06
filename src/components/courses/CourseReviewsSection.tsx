import { CourseReview, ReviewStats } from '@/types';
import { Star } from 'lucide-react';

interface CourseReviewsSectionProps {
  reviews: CourseReview[];
  reviewStats: ReviewStats;
}

function StarRow({ rating, count, total }: { rating: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs text-gray-500 w-3 text-right tabular-nums">{rating}</span>
      <Star size={11} className="text-amber-400 fill-amber-400 flex-shrink-0" />
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-5 text-right tabular-nums">{count}</span>
    </div>
  );
}

export function CourseReviewsSection({ reviews, reviewStats }: CourseReviewsSectionProps) {
  if (reviewStats.total === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-5">
        Student Reviews
        <span className="ml-2 text-base font-normal text-gray-400">({reviewStats.total})</span>
      </h2>

      {/* Summary */}
      <div className="border border-gray-200 rounded-xl p-6 mb-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        {/* Big number */}
        <div className="flex flex-col items-center flex-shrink-0">
          <span className="text-5xl font-bold text-gray-900 leading-none">
            {reviewStats.average.toFixed(1)}
          </span>
          <div className="flex items-center gap-0.5 mt-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={14}
                className={
                  s <= Math.round(reviewStats.average)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200'
                }
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 mt-1">{reviewStats.total} ratings</span>
        </div>

        {/* Breakdown */}
        <div className="flex-1 space-y-1.5 w-full">
          {([5, 4, 3, 2, 1] as const).map((star) => (
            <StarRow
              key={star}
              rating={star}
              count={reviewStats.breakdown[star] ?? 0}
              total={reviewStats.total}
            />
          ))}
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border border-gray-100 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm flex-shrink-0 overflow-hidden">
                {review.student?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.student.avatar_url}
                    alt={review.student.full_name ?? ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  review.student?.full_name?.charAt(0) ?? 'S'
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {review.student?.full_name ?? 'Student'}
                </p>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={11}
                      className={
                        s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                      }
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-400 ml-auto">
                {new Date(review.created_at).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            {review.comment && (
              <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
