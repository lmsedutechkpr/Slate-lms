export type UserRole = 'student' | 'instructor' | 'vendor' | 'admin';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type PreferredLanguage = 'en' | 'ta';
export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type ContentLanguage = 'english' | 'tamil' | 'both';
export type ActivityType =
  | 'enrollment'
  | 'lecture_complete'
  | 'course_complete'
  | 'wishlist_add'
  | 'course_review'
  | 'purchase'
  | 'quiz_attempt'
  | 'certificate_earned';
export type NotificationType =
  | 'enrollment'
  | 'lecture_unlock'
  | 'course_complete'
  | 'new_course'
  | 'promotional'
  | 'system';

export interface NotificationPrefs {
  email_updates: boolean;
  course_reminders: boolean;
  new_course_alerts: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  approval_status: ApprovalStatus;
  preferred_language: PreferredLanguage;
  interests: string[];
  bio: string | null;
  is_onboarded: boolean;
  notification_prefs: NotificationPrefs | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
  getRedirectPath: () => string;
}

export interface Category {
  id: string;
  name: string;
  name_ta: string | null;
  slug: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  title_ta: string | null;
  slug: string;
  description: string | null;
  description_ta: string | null;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  instructor_id: string | null;
  category_id: string | null;
  difficulty: CourseDifficulty;
  language: ContentLanguage;
  price: number;
  duration_minutes: number;
  total_lectures: number;
  tags: string[];
  requirements: string[];
  what_you_learn: string[];
  rating: number;
  rating_count: number;
  enrollment_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category | Category[] | null;
  instructor?: Profile | Profile[] | null;
  sections?: CourseSection[];
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  progress_percent: number;
  last_accessed_at: string | null;
  course?: Course;
}

export interface Wishlist {
  id: string;
  student_id: string;
  course_id: string;
  added_at: string;
  course?: Course;
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  title_ta: string | null;
  order_index: number;
  created_at: string;
  lectures?: Lecture[];
}

export interface Lecture {
  id: string;
  section_id: string;
  course_id: string;
  title: string;
  title_ta: string | null;
  description: string | null;
  video_url: string | null;
  content_type: 'video' | 'text' | 'quiz';
  content: string | null;
  duration_minutes: number;
  order_index: number;
  is_free_preview: boolean;
  resources: any[];
  created_at: string;
}

export interface LectureProgress {
  id: string;
  student_id: string;
  lecture_id: string;
  course_id: string;
  is_completed: boolean;
  watch_time_seconds: number;
  completed_at: string | null;
}

export interface CourseReview {
  id: string;
  course_id: string;
  student_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  student?: Profile;
}

export interface Certificate {
  id: string;
  student_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  course?: Course;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  title_ta: string | null;
  message: string;
  message_ta: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface UserActivityLog {
  id: string;
  student_id: string;
  activity_type: ActivityType;
  course_id: string | null;
  product_id: string | null;
  lecture_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  // Joined
  course?: Course;
  lecture?: Lecture;
}

export interface ReviewStats {
  average: number;
  total: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  course_id: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  time_taken_seconds: number | null;
  started_at: string;
  completed_at: string | null;
  attempt_number: number;
  // Joined
  course?: { title: string; title_ta: string | null; slug: string } | null;
  quiz?: { title: string; title_ta: string | null } | null;
}

export interface WishlistItem {
  id: string;
  student_id: string;
  course_id: string;
  added_at: string;
  course?: Course | null;
}

export interface DashboardStats {
  enrolled: number;
  completed: number;
  inProgress: number;
  hoursLearned: number;
  certificates: number;
  currentStreak: number;
}

export interface Product {
  id: string;
  vendor_id: string | null;
  category_id: string | null;
  name: string;
  name_ta: string | null;
  slug: string;
  description: string | null;
  description_ta: string | null;
  price: number;
  images: string[];
  stock_quantity: number;
  sku: string | null;
  tags: string[];
  specs: Record<string, any> | null;
  rating: number;
  rating_count: number;
  status: string;
  is_featured: boolean;
  course_tags: string[];
  created_at: string;
  updated_at: string;
  category?: Category;
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

export interface ProductCategory {
  id: string;
  name: string;
  name_ta: string | null;
  slug: string;
  icon: string | null;
  description: string | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  student_id: string;
  item_type: 'course' | 'product';
  course_id: string | null;
  product_id: string | null;
  quantity: number;
  added_at: string;
  course?: Course | Course[] | null;
  product?: Product | Product[] | null;
}

export interface Order {
  id: string;
  student_id: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  total_amount: number;
  payment_method: string;
  payment_reference: string | null;
  billing_name: string;
  billing_email: string;
  billing_phone: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: 'course' | 'product';
  course_id: string | null;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  course?: Course;
  product?: Product;
}
