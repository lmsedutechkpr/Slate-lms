'use server';

import { createClient } from '@/lib/supabase/server';
import { Product, ProductCategory, ProductReview, ReviewStats } from '@/types';

export interface GetProductsParams {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  inStockOnly: boolean;
  sort: string;
  page: number;
  limit: number;
}

export interface GetProductsResult {
  products: Product[];
  total: number;
  totalPages: number;
}

export async function getProducts(params: GetProductsParams): Promise<GetProductsResult> {
  try {
    const supabase = await createClient();
    const { search, category, minPrice, maxPrice, minRating, inStockOnly, sort, page, limit } = params;

    // Resolve category slug to id if needed
    let categoryId: string | null = null;
    if (category && category !== 'all') {
      const { data: cat } = await supabase
        .from('product_categories')
        .select('id')
        .eq('slug', category)
        .single();
      categoryId = cat?.id ?? null;
      if (!categoryId) {
        return { products: [], total: 0, totalPages: 0 };
      }
    }

    let query = supabase
      .from('products')
      .select('*, category:product_categories(id, name, name_ta, slug, icon)', { count: 'exact' })
      .eq('status', 'active');

    if (search && search.length > 1) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (minPrice > 0) {
      query = query.gte('price', minPrice);
    }
    if (maxPrice > 0) {
      query = query.lte('price', maxPrice);
    }
    if (minRating > 0) {
      query = query.gte('rating', minRating);
    }
    if (inStockOnly) {
      query = query.gt('stock_quantity', 0);
    }

    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
        break;
      default:
        query = query.order('rating_count', { ascending: false });
    }

    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    const total = count ?? 0;
    return {
      products: (data ?? []) as Product[],
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch {
    return { products: [], total: 0, totalPages: 0 };
  }
}

export interface GetProductBySlugResult {
  product: Product | null;
  reviews: ProductReview[];
  reviewStats: ReviewStats;
  relatedProducts: Product[];
}

export async function getProductBySlug(slug: string): Promise<GetProductBySlugResult> {
  const empty: GetProductBySlugResult = {
    product: null,
    reviews: [],
    reviewStats: { average: 0, total: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
    relatedProducts: [],
  };

  try {
    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from('products')
      .select('*, category:product_categories(*), vendor:profiles(id, full_name, avatar_url)')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error || !product) return empty;

    const [reviewsRes, relatedRes] = await Promise.all([
      supabase
        .from('product_reviews')
        .select('*, student:profiles(id, full_name, avatar_url)')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('products')
        .select('*, category:product_categories(*)')
        .eq('category_id', product.category_id)
        .eq('status', 'active')
        .neq('id', product.id)
        .order('rating', { ascending: false })
        .limit(4),
    ]);

    const reviews = (reviewsRes.data ?? []) as ProductReview[];
    const relatedProducts = (relatedRes.data ?? []) as Product[];

    // Compute review stats
    const ratingRows = reviews.map((r) => r.rating);
    const total = ratingRows.length;
    const average = total > 0 ? ratingRows.reduce((a, b) => a + b, 0) / total : 0;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as ReviewStats['breakdown'];
    ratingRows.forEach((r) => {
      const key = Math.round(r) as 1 | 2 | 3 | 4 | 5;
      if (key >= 1 && key <= 5) breakdown[key]++;
    });

    return {
      product: product as Product,
      reviews,
      reviewStats: { average, total, breakdown },
      relatedProducts,
    };
  } catch {
    return empty;
  }
}

export async function getProductCategories(): Promise<ProductCategory[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return (data ?? []) as ProductCategory[];
  } catch {
    return [];
  }
}

export async function getProductCategoryCounts(): Promise<Record<string, number>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('category_id')
      .eq('status', 'active');
    if (error) throw error;

    const counts: Record<string, number> = {};
    (data ?? []).forEach((row) => {
      if (row.category_id) {
        counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
      }
    });
    return counts;
  } catch {
    return {};
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:product_categories(*)')
      .eq('status', 'active')
      .eq('is_featured', true)
      .gt('stock_quantity', 0)
      .order('rating', { ascending: false })
      .limit(4);
    if (error) throw error;
    return (data ?? []) as Product[];
  } catch {
    return [];
  }
}
