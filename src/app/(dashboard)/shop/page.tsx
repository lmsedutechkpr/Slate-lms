import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Sparkles, 
  Star,
  Headphones,
  PenTool,
  Zap,
  Package,
  Lightbulb,
  HardDrive
} from 'lucide-react';

import {
  getProducts,
  getProductCategories,
  getProductCategoryCounts,
  getFeaturedProducts,
} from '@/lib/actions/shop';

const categoryGradients: Record<string, string> = {
  audio: 'from-violet-500 to-purple-700',
  writing: 'from-blue-500 to-indigo-600',
  power: 'from-amber-500 to-orange-600',
  accessories: 'from-gray-600 to-gray-800',
  lighting: 'from-yellow-400 to-amber-500',
  storage: 'from-teal-500 to-cyan-600',
};

const categoryIcons: Record<string, any> = {
  audio: Headphones,
  writing: PenTool,
  power: Zap,
  accessories: Package,
  lighting: Lightbulb,
  storage: HardDrive,
};
import { addToCart } from '@/lib/actions/cart';
import { ShopCategoryTabs } from '@/components/shop/ShopCategoryTabs';
import { ShopSearch } from '@/components/shop/ShopSearch';
import { ShopSort } from '@/components/shop/ShopSort';
import { ShopFilters } from '@/components/shop/ShopFilters';
import { ActiveShopFilters } from '@/components/shop/ActiveShopFilters';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { ProductCard } from '@/components/shop/ProductCard';

interface ShopPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    inStock?: string;
    sort?: string;
    view?: string;
    page?: string;
  }>;
}

const LIMIT = 12;

export default async function ShopPage({ searchParams }: ShopPageProps) {
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

  const sp = await searchParams;
  const search = sp.search ?? '';
  const category = sp.category ?? 'all';
  const minPrice = Number(sp.minPrice ?? 0);
  const maxPrice = Number(sp.maxPrice ?? 0);
  const rating = Number(sp.rating ?? 0);
  const inStockOnly = sp.inStock === 'true';
  const sort = sp.sort ?? 'popular';
  const view = (sp.view === 'list' ? 'list' : 'grid') as 'grid' | 'list';
    const page = Math.max(1, Number(sp.page ?? 1));
    const lang = (profile?.preferred_language ?? 'en') as 'en' | 'ta';

    // Fetch relevant categories for recommended badge
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

  const [categories, categoryCounts, featured, { products, total, totalPages }] =
    await Promise.all([
      getProductCategories(),
      getProductCategoryCounts(),
      page === 1 && category === 'all' && !search && minPrice === 0 && maxPrice === 0 && rating === 0 && !inStockOnly
        ? getFeaturedProducts()
        : Promise.resolve([]),
      getProducts({ search, category, minPrice, maxPrice, minRating: rating, inStockOnly, sort, page, limit: LIMIT }),
    ]);

  // Find active category name for filter pill
  const activeCategoryObj = categories.find((c) => c.slug === category);
  const activeCategoryName =
    lang === 'ta' && activeCategoryObj?.name_ta
      ? activeCategoryObj.name_ta
      : activeCategoryObj?.name;

  const hasActiveFilters =
    category !== 'all' || minPrice > 0 || maxPrice > 0 || rating > 0 || inStockOnly || !!search;

  const showingFrom = (page - 1) * LIMIT + 1;
  const showingTo = Math.min(page * LIMIT, total);

  return (
    // Escape layout padding and fill the full main height
    <div className="-mx-4 lg:-mx-8 -mt-8 -mb-12 bg-gray-50 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ── Sticky page header ── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-8 py-4 z-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <ShoppingBag size={15} className="text-gray-400" />
              <span className="text-gray-500 text-xs">Store</span>
            </div>
            <h1 className="text-gray-900 font-bold text-2xl tracking-tight">Shop</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {total > 0
                ? `Showing ${showingFrom}–${showingTo} of ${total} product${total !== 1 ? 's' : ''}`
                : 'No products found'}
            </p>
          </div>
          <Suspense>
            <ShopSort sort={sort} view={view} />
          </Suspense>
        </div>
      </div>

      {/* ── Body row (sidebar + content) — fills remaining height ── */}
      <div className="flex flex-1 min-h-0">

        {/* Filter sidebar — sticky, scrolls internally */}
        <div className="hidden lg:flex flex-shrink-0">
          <Suspense>
            <ShopFilters
              categories={categories}
              categoryCounts={categoryCounts}
              activeFilters={{ category, minPrice, maxPrice, rating, inStockOnly }}
            />
          </Suspense>
        </div>

        {/* Right column — category tabs + search sticky, product area scrolls */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">

          {/* Sticky: category tabs */}
          <div className="flex-shrink-0 bg-white border-b border-gray-100 z-10">
            <Suspense>
              <ShopCategoryTabs
                categories={categories}
                activeCategory={category}
                counts={categoryCounts}
              />
            </Suspense>
          </div>

          {/* Sticky: search + active filters */}
          <div className="flex-shrink-0 bg-white border-b border-gray-100 z-10">
            <div className="px-6 pt-3 pb-3">
              <Suspense>
                <ShopSearch defaultValue={search} />
              </Suspense>
            </div>
            {hasActiveFilters && (
              <Suspense>
                <ActiveShopFilters
                  search={search}
                  category={category}
                  categoryName={activeCategoryName}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  rating={rating}
                  inStockOnly={inStockOnly}
                />
              </Suspense>
            )}
          </div>

          {/* Scrollable product area */}
          <div className="flex-1 overflow-y-auto min-h-0">

            {/* Featured banner */}
            {featured.length > 0 && (
              <div className="px-6 pt-5 mb-2">
                <div className="hidden md:flex bg-gray-900 rounded-2xl p-6 gap-8 items-center mb-8">
                  <div className="flex flex-col gap-1 w-1/3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-amber-400" />
                      <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">
                        Featured
                      </span>
                    </div>
                    <h2 className="text-white font-bold text-xl">Handpicked gear</h2>
                    <p className="text-gray-400 text-sm">Boost your learning experience</p>
                  </div>

                  <div className="flex-1 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {featured.map((fp) => {
                      const slug = fp.category?.slug ?? '';
                      const CategoryIcon = categoryIcons[slug] ?? Package;
                      return (
                        <Link
                          key={fp.id}
                          href={`/shop/${fp.slug}`}
                          className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-colors min-w-[200px]"
                        >
                          <div
                            className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${
                              categoryGradients[slug] ?? 'from-gray-500 to-gray-700'
                            }`}
                          >
                            <CategoryIcon className="w-6 h-6 text-white/70" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-white text-xs font-semibold line-clamp-1">
                              {fp.name}
                            </p>
                            <p className="text-gray-300 text-xs mt-0.5">
                              ₹{fp.price.toLocaleString('en-IN')}
                            </p>
                            {fp.rating > 0 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                <span className="text-gray-300 text-[10px]">
                                  {fp.rating}
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-gray-400 text-xs font-medium">All Products</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              </div>
            )}

            {/* Product grid / list */}
            <div className="px-6 pb-10">
              <Suspense>
                <ProductGrid
                  products={products}
                  view={view}
                  lang={lang}
                  studentId={user.id}
                  search={search}
                  category={category}
                  relevantCategories={relevantCategories}
                />
              </Suspense>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {page > 1 && (
                    <a
                      href={`/shop?${buildParams(sp, { page: String(page - 1) })}`}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors"
                    >
                      Previous
                    </a>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | '...')[]>((acc, p, i, arr) => {
                      if (i > 0 && typeof arr[i - 1] === 'number' && (p as number) - (arr[i - 1] as number) > 1) {
                        acc.push('...');
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                      ) : (
                        <a
                          key={p}
                          href={`/shop?${buildParams(sp, { page: String(p) })}`}
                          className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                            p === page
                              ? 'bg-black text-white border-black'
                              : 'border-gray-200 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          {p}
                        </a>
                      )
                    )}
                  {page < totalPages && (
                    <a
                      href={`/shop?${buildParams(sp, { page: String(page + 1) })}`}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors"
                    >
                      Next
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildParams(
  current: Record<string, string | undefined>,
  overrides: Record<string, string>
): string {
  const params = new URLSearchParams();
  const merged = { ...current, ...overrides };
  Object.entries(merged).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== '0' && v !== 'false' && v !== 'all') {
      params.set(k, v);
    }
  });
  return params.toString();
}
