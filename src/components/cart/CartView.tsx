'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CartItem } from '@/types';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Loader2, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/store/cartStore';
import { CourseThumbnail } from '@/components/shared/CourseThumbnail';
import { DifficultyBadge } from '@/components/shared/DifficultyBadge';
import { cn } from '@/lib/utils';

interface CartViewProps {
  initialItems: CartItem[];
}

export function CartView({ initialItems }: CartViewProps) {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { increment, decrement } = useCartStore();

  const supabase = createClient();

  const getItemPrice = (item: CartItem): number => {
    if (item.item_type === 'course' || item.course_id) {
      const course = Array.isArray(item.course) ? item.course[0] : item.course;
      return course?.price ?? 0;
    }
    if (item.item_type === 'product' || item.product_id) {
      const product = Array.isArray(item.product) ? item.product[0] : item.product;
      return product?.price ?? 0;
    }
    return 0;
  };

  const getItemName = (item: CartItem): string => {
    if (item.item_type === 'course' || item.course_id) {
      const course = Array.isArray(item.course) ? item.course[0] : item.course;
      return course?.title ?? 'Course';
    }
    if (item.item_type === 'product' || item.product_id) {
      const product = Array.isArray(item.product) ? item.product[0] : item.product;
      return product?.name ?? 'Product';
    }
    return 'Item';
  };

  const getItemImage = (item: CartItem): string | null => {
    if (item.item_type === 'course' || item.course_id) {
      const course = Array.isArray(item.course) ? item.course[0] : item.course;
      return course?.thumbnail_url ?? null;
    }
    const product = Array.isArray(item.product) ? item.product[0] : item.product;
    const imgs = product?.images;
    return Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : null;
  };

  const getItemLink = (item: CartItem): string => {
    if (item.item_type === 'course' || item.course_id) {
      const course = Array.isArray(item.course) ? item.course[0] : item.course;
      return `/courses/${course?.slug ?? ''}`;
    }
    const product = Array.isArray(item.product) ? item.product[0] : item.product;
    return `/shop/${product?.slug ?? ''}`;
  };

  const subtotal = items.reduce((sum, item) => {
    if (item.item_type === 'course' || item.course_id) {
      const course = Array.isArray(item.course) ? item.course[0] : item.course;
      return sum + (course?.price ?? 0);
    }
    if (item.item_type === 'product' || item.product_id) {
      const product = Array.isArray(item.product) ? item.product[0] : item.product;
      return sum + (product?.price ?? 0) * (item.quantity ?? 1);
    }
    return sum;
  }, 0);

  const removeItem = async (item: CartItem) => {
    setLoadingId(item.id);
    await supabase.from('cart_items').delete().eq('id', item.id);
    decrement(item.quantity);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setLoadingId(null);
    startTransition(() => router.refresh());
  };

  const updateQty = async (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      removeItem(item);
      return;
    }
    setLoadingId(item.id + '_qty');
    await supabase.from('cart_items').update({ quantity: newQty }).eq('id', item.id);

    if (delta > 0) {
      increment(delta);
    } else {
      decrement(Math.abs(delta));
    }

    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantity: newQty } : i)));
    setLoadingId(null);
    startTransition(() => router.refresh());
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
          <ShoppingCart size={32} className="text-gray-300" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          Browse courses and products to add them to your cart.
        </p>
        <div className="flex gap-3">
          <Link href="/courses" className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium rounded-xl px-5 py-2.5 hover:bg-gray-800 transition-colors">
            Browse Courses
          </Link>
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl px-5 py-2.5 hover:bg-gray-50 transition-colors">
            Visit Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-5xl">
      {/* Items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => {
              const isRemoving = loadingId === item.id;
              const isUpdating = loadingId === item.id + '_qty';

              if (item.item_type === 'course' || item.course_id) {
                const course = Array.isArray(item.course) ? item.course[0] : item.course;
                const category = Array.isArray(course?.category) ? course.category[0] : course?.category;

                return (
                  <div key={item.id} className={cn("bg-white border border-gray-200 rounded-xl p-4 flex gap-4 transition-opacity", isRemoving && "opacity-40")}>
                    {/* Thumbnail */}
                    <div className="relative w-28 h-18 rounded-lg overflow-hidden flex-shrink-0 aspect-video">
                      {course && <CourseThumbnail course={course} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Course</span>
                      <h3 className="text-gray-900 font-semibold text-sm mt-0.5 line-clamp-2">
                        {course?.title ?? 'Course'}
                      </h3>

                      <div className="flex items-center gap-3 mt-1.5">
                        {category?.name && (
                          <span className="text-gray-400 text-xs">{category.name}</span>
                        )}
                        {course && <DifficultyBadge difficulty={course.difficulty} />}
                      </div>

                      <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Lifetime access after purchase
                      </p>
                    </div>

                    {/* Price + Remove */}
                    <div className="flex flex-col items-end justify-between flex-shrink-0">
                      <div className="text-right">
                        <p className="text-gray-900 font-bold text-base">
                          ₹{(course?.price ?? 0).toLocaleString('en-IN')}
                        </p>

                      </div>

                      <button
                        onClick={() => removeItem(item)}
                        disabled={isRemoving}
                        className="flex items-center gap-1 text-gray-400 text-xs hover:text-red-500 transition-150 disabled:opacity-50"
                      >
                        {isRemoving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Remove
                      </button>
                    </div>
                  </div>
                );
              }

              // Product Item
              const product = Array.isArray(item.product) ? item.product[0] : item.product;
              const name = getItemName(item);
              const image = getItemImage(item);
              const price = getItemPrice(item);
              const link = getItemLink(item);

              return (
                <div key={item.id} className={cn("bg-white border border-gray-200 rounded-xl p-4 flex gap-4 transition-opacity", isRemoving && "opacity-40")}>
                  <Link href={link} className="flex-shrink-0">
                    <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100">
                      {image ? (
                        <Image src={image} alt={name} width={80} height={64} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart size={20} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={link} className="text-sm font-medium text-gray-900 hover:text-black line-clamp-2 leading-snug">{name}</Link>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-1">Product</p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{(price * item.quantity).toLocaleString('en-IN')}
                      </span>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQty(item, -1)}
                            disabled={isUpdating}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-xs font-medium text-gray-900">
                            {isUpdating ? <Loader2 size={10} className="animate-spin mx-auto" /> : item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item, 1)}
                            disabled={isUpdating}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item)}
                          disabled={isRemoving}
                          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isRemoving ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>


      {/* Order Summary */}
      <div className="w-full lg:w-72 flex-shrink-0">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Order Summary</h2>

          <div className="space-y-3 pb-4 border-b border-gray-100">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-600">
                <span className="truncate flex-1 mr-2">{getItemName(item)}</span>
                <span className="font-medium text-gray-900 flex-shrink-0">
                  ₹{(getItemPrice(item) * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-sm font-semibold text-gray-900 pt-4 mb-6">
            <span>Total</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          <Link
            href="/dashboard/checkout"
            className="flex items-center justify-center gap-2 w-full bg-black text-white text-sm font-medium rounded-xl py-3 hover:bg-gray-800 transition-colors"
          >
            Proceed to Checkout
            <ArrowRight size={15} />
          </Link>

          <Link href="/courses" className="flex items-center justify-center text-xs text-gray-500 mt-3 hover:text-gray-700">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
