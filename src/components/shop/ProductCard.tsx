'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import {
  ShoppingCart,
  Sparkles,
  AlertCircle,
  Star,
  Check,
  Loader2,
  Headphones,
  PenTool,
  Zap,
  Package,
  Lightbulb,
  HardDrive,
  LucideIcon,
} from 'lucide-react';
import { Product } from '@/types';
import { addToCart } from '@/lib/actions/cart';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  lang: 'en' | 'ta';
  relevantCategories?: Set<string>;
  studentId?: string;
}

const categoryGradients: Record<string, string> = {
  audio: 'from-violet-500 to-purple-700',
  writing: 'from-blue-500 to-indigo-600',
  power: 'from-amber-500 to-orange-600',
  accessories: 'from-gray-600 to-gray-800',
  lighting: 'from-yellow-400 to-amber-500',
  storage: 'from-teal-500 to-cyan-600',
};

const categoryIcons: Record<string, LucideIcon> = {
  audio: Headphones,
  writing: PenTool,
  power: Zap,
  accessories: Package,
  lighting: Lightbulb,
  storage: HardDrive,
};

export function ProductCard({
  product,
  lang,
  relevantCategories,
  studentId,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const router = useRouter();
    const increment = useCartStore((s) => s.increment);


  const categorySlug = (product.category as any)?.slug ?? '';
  const gradient = categoryGradients[categorySlug] ?? 'from-gray-500 to-gray-700';
  const CategoryIcon = categoryIcons[categorySlug] ?? Package;

  const displayName = lang === 'ta' && product.name_ta ? product.name_ta : product.name;
  const displayCategory =
    lang === 'ta' && (product.category as any)?.name_ta
      ? (product.category as any).name_ta
      : (product.category as any)?.name ?? '';

  const hasImages = Array.isArray(product.images) && product.images.length > 0;

  const isRecommended =
    product.course_tags != null &&
    product.course_tags.length > 0 &&
    (relevantCategories?.size ?? 0) > 0 &&
    product.course_tags.some((tag) => relevantCategories?.has(tag));

  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  const discountPct = 0;

  return (
    <div
      onClick={() => router.push(`/shop/${product.slug}`)}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer flex flex-col hover:border-gray-300 hover:shadow-md transition-all duration-150"
    >
      {/* ── IMAGE SECTION ── */}
      <div className="relative w-full aspect-square flex-shrink-0 overflow-hidden">
        {hasImages ? (
          <Image
            src={product.images[0]}
            alt={displayName}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
          >
            <CategoryIcon className="w-14 h-14 text-white/50" />
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 font-semibold text-xs rounded-full px-3 py-1.5">
              Out of Stock
            </span>
          </div>
        )}

        {/* Recommended badge — TOP LEFT */}
        {isRecommended && !isOutOfStock && (
          <div className="absolute top-2.5 left-2.5">
            <span className="bg-black/80 backdrop-blur-sm text-white text-[10px] font-semibold rounded-full px-2.5 py-1 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              For you
            </span>
          </div>
        )}

        {/* Discount badge — TOP RIGHT */}
        {discountPct > 0 && !isOutOfStock && (
          <div className="absolute top-2.5 right-2.5">
            <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full px-2 py-1">
              -{discountPct}%
            </span>
          </div>
        )}
      </div>
      {/* ── END IMAGE SECTION ── */}

      {/* ── CARD BODY ── */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category + Stock dot row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-[11px] font-medium uppercase tracking-wide truncate">
            {displayCategory}
          </span>

          {/* Stock indicator dot */}
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ml-2 ${
              isOutOfStock ? 'bg-red-400' : isLowStock ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
          />
        </div>

        {/* Product name */}
        <h3 className="text-gray-900 font-semibold text-sm leading-snug line-clamp-2 mb-3 flex-1">
          {displayName}
        </h3>

        {/* Rating — only if rating > 0 */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= Math.round(product.rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-200 fill-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-500 text-[11px]">
              ({product.rating_count.toLocaleString('en-IN')})
            </span>
          </div>
        )}

        {/* Low stock warning */}
        {isLowStock && (
          <div className="flex items-center gap-1 mb-2">
            <AlertCircle className="w-3 h-3 text-amber-500 flex-shrink-0" />
            <span className="text-amber-600 text-[11px] font-medium">
              Only {product.stock_quantity} left
            </span>
          </div>
        )}

        {/* ── FOOTER: Price + Cart button ── */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 mt-auto">
          {/* Price column */}
          <div className="flex flex-col min-w-0">
            <span className="text-gray-900 font-bold text-base leading-tight">
              ₹{product.price.toLocaleString('en-IN')}
            </span>

          </div>

          {/* Add to Cart button — INLINE, not floating */}
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (isOutOfStock) return;
              if (!studentId) {
                router.push('/login');
                return;
              }
              setIsAdding(true);
              try {
                const result = await addToCart({ itemType: 'product', productId: product.id, quantity: 1 });
                  if (result.error) {
                    toast.error(result.error);
                  } else {
                    increment(1);
                    setJustAdded(true);

                  toast.success(`${product.name} added to cart`);
                  setTimeout(() => setJustAdded(false), 1500);
                }
              } catch (err) {
                toast.error('Failed to add to cart');
              } finally {
                setIsAdding(false);
              }
            }}
            disabled={isOutOfStock || isAdding}
            className={`flex-shrink-0 rounded-lg p-2.5 flex items-center justify-center transition-all duration-150 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-black text-white hover:bg-gray-800 active:scale-95'
            }`}
            title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : justAdded ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
        {/* ── END FOOTER ── */}
      </div>
      {/* ── END CARD BODY ── */}
    </div>
  );
}
