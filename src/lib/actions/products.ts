'use server';

import { createClient } from '@/lib/supabase/server';

export async function getRecommendedProducts(interests: string[], enrolledCategoryIds: string[]) {
  const supabase = await createClient();

  // Step 1: Resolve category names from enrolledCategoryIds to match with product courseTags
  let userTags = [...interests];
  
  if (enrolledCategoryIds.length > 0) {
    const { data: cats } = await supabase
      .from('categories')
      .select('name')
      .in('id', enrolledCategoryIds);
      
    if (cats) {
      userTags = [...userTags, ...cats.map(c => c.name)];
    }
  }

  // Deduplicate and lower
  userTags = Array.from(new Set(userTags.map(t => t.trim().toLowerCase()))).filter(t => t);

  if (userTags.length === 0) {
    // Return newest generic products if no overlap criteria
    const { data } = await supabase
      .from('products')
      .select('id, name, price, original_price, images, course_tags')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(4);
    return data || [];
  }

  // Step 2: Query products where course_tags overlap with userTags
  // Supabase RPC or direct array overlaps. 
  // Postgres array overlap operator is &&. In PostgREST, it's .cd() or .ov()
  // PostgREST: .overlaps('course_tags', userTags)
  
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, original_price, images, course_tags')
    .eq('status', 'active')
    .overlaps('course_tags', userTags)
    .limit(4);

  if (error || !data || data.length === 0) {
    // Fallback to random/newest if no overlap found
    const { data: fallback } = await supabase
      .from('products')
      .select('id, name, price, original_price, images, course_tags')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(4);
    return fallback || [];
  }

  return data;
}
