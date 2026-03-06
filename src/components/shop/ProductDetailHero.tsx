import { Product } from '@/types';
import { CheckCircle2, AlertCircle, XCircle, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductDetailHeroProps {
  product: Product;
  lang?: 'en' | 'ta';
  isRecommended?: boolean;
}

export function ProductDetailHero({ 
  product, 
  lang = 'en', 
  isRecommended = false 
}: ProductDetailHeroProps) {
  const name = lang === 'ta' && product.name_ta ? product.name_ta : product.name;
  const description = lang === 'ta' && product.description_ta ? product.description_ta : product.description;
  const category = (product.category as any) ?? {};
  const catName = lang === 'ta' && category.name_ta ? category.name_ta : category.name ?? '';
  const stock = product.stock_quantity ?? 0;

  let stockLabel = 'In Stock';
  let stockBadgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let StockIcon = CheckCircle2;

  if (stock === 0) {
    stockLabel = 'Out of Stock';
    stockBadgeStyle = 'bg-red-50 text-red-700 border-red-200';
    StockIcon = XCircle;
  } else if (stock <= 10) {
    stockLabel = 'Low Stock';
    stockBadgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
    StockIcon = AlertCircle;
  }

  return (
    <div className="mb-8">
      
      {/* BADGES */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Category badge */}
        {catName && (
          <span className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-semibold">
            {catName}
          </span>
        )}
        
        {/* Stock badge */}
        <span className={`rounded-full px-3 py-1 text-xs font-semibold border flex items-center gap-1.5 ${stockBadgeStyle}`}>
          <StockIcon className="w-3 h-3" />
          {stockLabel}
        </span>
        
        {/* Recommended badge (only if relevant) */}
        {isRecommended && (
          <span className="bg-black text-white rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Recommended for learners
          </span>
        )}
      </div>
      
      {/* TITLE */}
      <h1 className="text-gray-900 font-bold text-3xl tracking-tight leading-tight mb-4">
        {name}
      </h1>
      
      {/* RATING — only if rating > 0 */}
      {product.rating > 0 && (
        <div className="flex items-center gap-3 mb-5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={16}
                className={cn(
                  i <= Math.round(product.rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200 fill-gray-200'
                )}
              />
            ))}
          </div>
          <span className="text-amber-600 font-bold text-sm">
            {product.rating}
          </span>
          <span className="text-gray-400 text-sm">
            ({product.rating_count?.toLocaleString('en-IN')} reviews)
          </span>
        </div>
      )}
      
      {/* DESCRIPTION */}
      <p className="text-gray-600 text-base leading-relaxed mb-6">
        {description}
      </p>
      
      {/* COURSE TAGS — only if course_tags.length > 0 */}
      {product.course_tags && product.course_tags.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 text-sm font-medium">
              Perfect for students learning:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.course_tags.map(tag => (
              <span key={tag}
                    className="bg-white border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600 font-medium capitalize">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
