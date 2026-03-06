import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/actions/shop';
import { addToCart } from '@/lib/actions/cart';
import { ProductImageGallery } from '@/components/shop/ProductImageGallery';
import { ProductDetailHero } from '@/components/shop/ProductDetailHero';
import { ProductSpecs } from '@/components/shop/ProductSpecs';
import { ProductReviews } from '@/components/shop/ProductReviews';
import { AddToCartButton } from '@/components/shop/AddToCartButton';
import { ProductCard } from '@/components/shop/ProductCard';
import { formatPrice, calcDiscount } from '@/components/shop/shopUtils';
import { 
  ChevronRight, 
  XCircle, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, preferred_language, interests')
    .eq('id', user.id)
    .single();

  const { slug } = await params;
  const { product, reviews, reviewStats, relatedProducts } = await getProductBySlug(slug);

  if (!product) notFound();

  const lang = (profile?.preferred_language ?? 'en') as 'en' | 'ta';
  const name = lang === 'ta' && product.name_ta ? product.name_ta : product.name;
  const category = (product.category as any) ?? {};
  const catName = lang === 'ta' && category.name_ta ? category.name_ta : category.name ?? '';
  const price = product.price;

  // Fetch relevant categories for badge logic
  let relevantCategories = new Set<string>();
  if (profile?.id) {
    const [{ data: enrolledData }, { data: wishlistData }] = await Promise.all([
      supabase
        .from('enrollments')
        .select('course:courses(category:categories(slug))')
        .eq('student_id', profile.id),
      supabase
        .from('wishlist')
        .select('course:courses(category:categories(slug))')
        .eq('student_id', profile.id),
    ]);

    const enrolledSlugs = (enrolledData ?? [])
      .flatMap((e: any) => e.course?.category?.slug ? [e.course.category.slug] : []);
    const wishlistSlugs = (wishlistData ?? [])
      .flatMap((e: any) => e.course?.category?.slug ? [e.course.category.slug] : []);
    const interests = Array.isArray(profile?.interests) ? profile.interests : [];

    relevantCategories = new Set([...enrolledSlugs, ...wishlistSlugs, ...interests]);
  }

  // Fetch existing cart quantity for this product
  let existingCartQty = 0;
  if (profile?.id) {
    const { data: cartData } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('student_id', profile.id)
      .eq('product_id', product.id)
      .maybeSingle();
    existingCartQty = cartData?.quantity ?? 0;
  }

  const isRecommended = product.course_tags?.some(tag => relevantCategories.has(tag)) ?? false;

  return (
    <div className="min-h-screen bg-white -mx-4 lg:-mx-8 -mt-8 -mb-12">
      {/* ZONE 1: BREADCRUMB (static, scrolls away) */}
      <div className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-500">
          <Link href="/shop" className="hover:text-gray-900 transition-colors">Shop</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/shop?category=${category.slug ?? ''}`} className="hover:text-gray-900 transition-colors">
            {catName}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{name}</span>
        </div>
      </div>

      {/* ZONE 2: MAIN CONTENT (two column) */}
      <div className="px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-10 items-start max-w-7xl mx-auto">
          
          {/* LEFT COLUMN */}
          <div className="w-full lg:flex-1 lg:min-w-0">
            <ProductImageGallery product={product} />
            <ProductDetailHero 
              product={product} 
              lang={lang} 
              isRecommended={isRecommended}
            />
            <ProductSpecs specs={product.specs} />
            <ProductReviews reviews={reviews} stats={reviewStats} />
          </div>
          
          {/* RIGHT COLUMN - PURCHASE SIDEBAR */}
          <div className="w-full lg:w-[340px] lg:flex-shrink-0 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              
              {/* PRICE SECTION */}
              <div className="p-6 border-b border-gray-100">
                {/* If out of stock */}
                {product.stock_quantity === 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 mb-4">
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-red-600 text-sm">
                      Currently out of stock
                    </span>
                  </div>
                )}
                
                {/* Price row */}
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-gray-900 font-bold text-4xl">
                    ₹{price.toLocaleString('en-IN')}
                  </span>

                </div>
              </div>
              
                {/* QUANTITY + ADD TO CART */}
                  <div className="p-6">
                    <AddToCartButton
                      product={product}
                      studentId={user.id}
                      existingCartQty={existingCartQty}
                    />
                  </div>

                
                {/* DELIVERY INFO */}
                <div className="px-6 pb-6 border-t border-gray-100 pt-5 space-y-2.5">

                <p className="text-gray-700 text-xs font-semibold uppercase tracking-wider mb-3">
                  Delivery & Returns
                </p>
                
                <div className="flex items-center gap-2.5">
                  <Truck className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 text-xs">
                    Free delivery on orders above ₹999
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 text-xs">
                    7-day easy returns
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 text-xs">
                    Secure checkout
                  </span>
                </div>
              </div>
              
              {/* STOCK COUNT */}
              {product.stock_quantity > 0 && product.stock_quantity <= 10 && (
                <div className="px-6 pb-5 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                    <span className="text-amber-600 text-xs font-medium">
                      Only {product.stock_quantity} left in stock
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        
        </div>
      </div>

      {/* ZONE 3 - RELATED PRODUCTS - FULL WIDTH */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-8 py-10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-gray-900 font-bold text-xl mb-6">
              You might also like
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {relatedProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    lang={lang}
                    relevantCategories={relevantCategories}
                    studentId={user.id}
                  />
                ))}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
