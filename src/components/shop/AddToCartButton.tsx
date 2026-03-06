'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Loader2,
  CheckCircle2,
  X,
  Minus,
  Plus,
  Package,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { addToCart } from '@/lib/actions/cart';

interface AddToCartButtonProps {
  product: Product;
  studentId?: string;
  existingCartQty?: number;
}

export function AddToCartButton({ product, studentId, existingCartQty = 0 }: AddToCartButtonProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'buying'>('idle');
  const increment = useCartStore((s) => s.increment);

  const stockQty = product.stock_quantity ?? 0;
  const effectiveStockInitial = Math.max(0, stockQty - existingCartQty);
  const [availableStock, setAvailableStock] = useState(effectiveStockInitial);

  if (availableStock === 0 && stockQty === 0) {
    return (
      <button
        disabled
        className="w-full bg-gray-100 text-gray-400 rounded-xl py-4 flex items-center justify-center gap-2 cursor-not-allowed"
      >
        <X size={16} />
        Out of Stock
      </button>
    );
  }

  if (availableStock === 0) {
    return (
      <button
        disabled
        className="w-full bg-gray-100 text-gray-400 rounded-xl py-4 flex items-center justify-center gap-2 cursor-not-allowed"
      >
        <X size={16} />
        Already in Cart (max reached)
      </button>
    );
  }

  const maxQty = Math.min(availableStock, 10);

  const handleAdd = async () => {
    if (!studentId) {
      router.push('/login');
      return;
    }
    setState('loading');
    const result = await addToCart({ itemType: 'product', productId: product.id, quantity });
    if (result.error) {
      toast.error(result.error || 'Failed to add to cart');
      setState('idle');
      } else {
        setState('success');
        increment(quantity);
        setAvailableStock((prev) => Math.max(0, prev - quantity));

      setQuantity(1);
      toast.success(`${product.name} added to cart`);
      setTimeout(() => setState('idle'), 2000);
    }
  };

  const handleBuyNow = async () => {
    if (!studentId) {
      router.push('/login');
      return;
    }
    setState('buying');
    const result = await addToCart({ itemType: 'product', productId: product.id, quantity });
    if (result.error) {
      toast.error(result.error || 'Failed to add to cart');
      setState('idle');
    } else {
      increment(quantity);
      router.push('/dashboard/cart');
    }
    };


  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 text-sm font-medium">Quantity</span>
          {/* Stock info */}
          <div className={cn('flex items-center gap-1.5 text-xs font-medium', availableStock <= 5 ? 'text-amber-600' : 'text-gray-500')}>
            {availableStock <= 5 ? <AlertCircle size={14} /> : <Package size={14} />}
            {availableStock <= 5 ? `Only ${availableStock} left!` : `${availableStock} available`}
          </div>
        </div>
        
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity === 1 || state !== 'idle'}
            className="flex-1 flex items-center justify-center py-3 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-r border-gray-200"
          >
            <Minus size={16} />
          </button>
          <span className="px-8 py-3 text-gray-900 font-bold text-base min-w-[64px] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            disabled={quantity >= maxQty || state !== 'idle'}
            className="flex-1 flex items-center justify-center py-3 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-l border-gray-200"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Add to Cart button */}
        <button
          onClick={handleAdd}
          disabled={state !== 'idle' && state !== 'success'}
          className={cn(
            'w-full rounded-xl py-4 font-semibold flex items-center justify-center gap-2 transition-colors',
            state === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-black text-white hover:bg-gray-800'
          )}
        >
          {state === 'loading' ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Adding...
            </>
          ) : state === 'success' ? (
            <>
              <CheckCircle2 size={18} />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              Add to Cart
            </>
          )}
        </button>

        {/* Buy Now button */}
        <button 
          onClick={handleBuyNow}
          disabled={state !== 'idle'}
          className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl py-4 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {state === 'buying' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Buy Now
            </>
          )}
        </button>
      </div>
    </div>
  );
}
