'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import {
  ShoppingCart,
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

interface ProductListItemProps {
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

export function ProductListItem({
  product,
  lang,
  studentId,
}: ProductListItemProps) {
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
  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  return (
    <div
      onClick={() => router.push(`/shop/${product.slug}`)}
      className="bg-white border border-gray-200 rounded-xl flex gap-4 p-4 cursor-pointer hover:border-gray-300 transition-150"
    >
      {/* Square image — fixed size in list view */}
      <div
        className={`relative w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br ${gradient}`}
      >
        {hasImages ? (
          <Image
            src={product.images[0]}
            alt={displayName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CategoryIcon className="w-10 h-10 text-white/50" />
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-[10px] font-semibold">Sold Out</span>
          </div>
        )}
      </div>

      {/* Middle content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-gray-400 text-[11px] uppercase tracking-wide mb-1">
          {displayCategory}
        </span>

        <h3 className="text-gray-900 font-semibold text-sm line-clamp-1 mb-1">
          {displayName}
        </h3>

        {product.description && (
          <p className="text-gray-500 text-xs line-clamp-2 mb-2">
            {product.description}
          </p>
        )}

        {product.rating > 0 && (
          <div className="flex items-center gap-1.5 mt-auto">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${
                    s <= Math.round(product.rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-200 fill-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-400 text-xs">
              ({product.rating_count.toLocaleString('en-IN')})
            </span>
          </div>
        )}
      </div>

      {/* Right: price + button */}
      <div className="flex flex-col items-end justify-between flex-shrink-0 w-28">
        <div className="text-right">
          {isLowStock && (
            <p className="text-amber-500 text-[10px] font-medium mb-1">
              Only {product.stock_quantity} left
            </p>
          )}
          <div className="flex items-center gap-1.5 justify-end">
            <span
              className={`w-2 h-2 rounded-full ${
                isOutOfStock ? 'bg-red-400' : isLowStock ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            <span className="text-gray-400 text-[11px]">
              {isOutOfStock
                ? 'Out of stock'
                : isLowStock
                ? `${product.stock_quantity} left`
                : 'In stock'}
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-gray-900 font-bold text-base">
            ₹{product.price.toLocaleString('en-IN')}
          </p>


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
                  increment(1);
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
            className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-150 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isAdding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : justAdded ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <ShoppingCart className="w-3.5 h-3.5" />
            )}
            {isAdding ? 'Adding...' : justAdded ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
