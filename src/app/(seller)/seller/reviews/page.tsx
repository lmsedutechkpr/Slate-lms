'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function SellerReviewsPage() {
  const supabase = createClient()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get all product IDs for this seller
        const { data: products, error: pError } = await supabase
          .from('products')
          .select('id, name')
          .eq('vendor_id', user.id)  // ← vendor_id

        if (pError) throw pError;

        const productIds = products?.map(p => p.id) || []

        if (productIds.length === 0) {
          setReviews([])
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('product_reviews')
          .select(`
            id, rating, comment, seller_reply, seller_replied_at, created_at,
            student_id,
            product:products!product_id(id, name, images)
          `)
          .in('product_id', productIds)
          .order('created_at', { ascending: false })

        if (error) throw error

        const reviewsData = data || []
        const studentIds = Array.from(new Set(reviewsData.map((r: any) => r.student_id).filter(Boolean)));
        let profilesMap: any = {}
        if (studentIds.length > 0) {
           const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', studentIds);
           if (profiles) profilesMap = profiles.reduce((acc: any, p: any) => ({ ...acc, [p.id]: p }), {});
        }
        
        const merged = reviewsData.map((r: any) => ({
           ...r,
           student: profilesMap[r.student_id as string] || null
        }));

        setReviews(merged)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load reviews')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
    : 0

  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percent: reviews.length ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0
  }))

  async function submitReply(reviewId: string) {
    if (!replyText.trim()) return
    const snap = reviews
    setReviews(prev => prev.map(r => r.id === reviewId
      ? { ...r, seller_reply: replyText, seller_replied_at: new Date().toISOString() }
      : r
    ))
    setReplyingTo(null)
    const { error } = await supabase.from('product_reviews').update({
      seller_reply: replyText,
      seller_replied_at: new Date().toISOString()
    }).eq('id', reviewId)
    if (error) { setReviews(snap); toast.error('Failed to save reply'); return }
    setReplyText('')
    toast.success('Reply posted!')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Read and respond to feedback from your customers</p>
        </div>
        {reviews.length > 0 && (
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{avgRating.toFixed(1)}</span>
              <div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={`text-lg ${s <= Math.round(avgRating) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 rounded w-3/4 mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-3xl">⭐</span>
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">No reviews yet</h3>
          <p className="text-sm text-gray-400 max-w-xs">When customers leave reviews on your products, they'll appear here. You can reply to build trust.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Rating breakdown sidebar */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Rating Breakdown</h3>
              {ratingBreakdown.map(({ star, count, percent }) => (
                <div key={star} className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500 w-4">{star}</span>
                  <span className="text-amber-400 text-sm">★</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-amber-400 rounded-full transition-all" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews list */}
          <div className="flex-1 space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start gap-3">
                  {review.student?.avatar_url
                    ? <img src={review.student.avatar_url} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    : <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-sm font-semibold text-emerald-700">
                        {review.student?.full_name?.[0]?.toUpperCase() || 'S'}
                      </div>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-semibold text-sm text-gray-800">{review.student?.full_name || 'Student'}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 mb-2">on {review.product?.name || 'Product'}</p>
                    <div className="flex gap-0.5 mb-2">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={`text-sm ${s <= review.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>

                    {/* Seller reply */}
                    {review.seller_reply ? (
                      <div className="mt-3 pl-3 border-l-2 border-emerald-200 bg-emerald-50/50 rounded-r-lg p-3">
                        <p className="text-xs font-semibold text-emerald-700 mb-1">Your reply</p>
                        <p className="text-sm text-gray-600">{review.seller_reply}</p>
                      </div>
                    ) : (
                      <>
                        {replyingTo === review.id ? (
                          <div className="mt-3">
                            <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                              placeholder="Write a helpful reply..."
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                              rows={3}
                            />
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => submitReply(review.id)}
                                disabled={!replyText.trim()}
                                className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg disabled:opacity-50">
                                Post Reply
                              </button>
                              <button onClick={() => { setReplyingTo(null); setReplyText('') }}
                                className="px-4 py-1.5 text-xs text-gray-500 hover:text-gray-700">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => { setReplyingTo(review.id); setReplyText('') }}
                            className="mt-2 text-xs text-emerald-600 hover:underline font-medium">
                            + Reply to this review
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
