export interface ProductCategory {
  id: string;
  name: string;
  name_ta: string | null;
  slug: string;
  icon: string | null;
  description: string | null;
  created_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  student_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  student?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}
