export type Lang = 'en' | 'ta';

export const t: Record<string, Record<Lang, string>> = {
  // Navigation
  dashboard: { en: 'Dashboard', ta: 'டாஷ்போர்டு' },
  my_courses: { en: 'My Courses', ta: 'என் படிப்புகள்' },
  browse_courses: { en: 'Browse Courses', ta: 'படிப்புகளை உலாவு' },
  shop: { en: 'Shop', ta: 'கடை' },
  cart: { en: 'Cart', ta: 'வண்டி' },
  my_orders: { en: 'My Orders', ta: 'என் ஆர்டர்கள்' },
  wishlist: { en: 'Wishlist', ta: 'விருப்பப்பட்டியல்' },
  progress: { en: 'Progress', ta: 'முன்னேற்றம்' },
  notifications: { en: 'Notifications', ta: 'அறிவிப்புகள்' },
  profile: { en: 'Profile', ta: 'சுயவிவரம்' },
  settings: { en: 'Settings', ta: 'அமைப்புகள்' },
  logout: { en: 'Logout', ta: 'வெளியேறு' },
  // Status
  enrolled: { en: 'Enrolled', ta: 'பதிவு செய்யப்பட்டது' },
  completed: { en: 'Completed', ta: 'முடிந்தது' },
  in_progress: { en: 'In Progress', ta: 'நடந்து வருகிறது' },
  not_started: { en: 'Not Started', ta: 'தொடங்கவில்லை' },
  // Actions
  start_course: { en: 'Start Course', ta: 'படிப்பை தொடங்கு' },
  continue_learning: { en: 'Continue Learning', ta: 'தொடர்ந்து கற்க' },
  enroll_free: { en: 'Enroll for Free', ta: 'இலவசமாக சேரவும்' },
  buy_now: { en: 'Buy Now', ta: 'இப்போது வாங்கு' },
  add_to_cart: { en: 'Add to Cart', ta: 'வண்டியில் சேர்' },
  add_to_wishlist: { en: 'Add to Wishlist', ta: 'விருப்பத்தில் சேர்' },
  view_details: { en: 'View Details', ta: 'விவரங்கள் காண்க' },
  // Empty states
  no_courses_yet: { en: 'No courses yet', ta: 'இன்னும் படிப்புகள் இல்லை' },
  no_orders_yet: { en: 'No orders yet', ta: 'இன்னும் ஆர்டர்கள் இல்லை' },
  no_notifications: { en: 'No notifications', ta: 'அறிவிப்புகள் இல்லை' },
  // Difficulty
  beginner: { en: 'Beginner', ta: 'தொடக்கநிலை' },
  intermediate: { en: 'Intermediate', ta: 'இடைநிலை' },
  advanced: { en: 'Advanced', ta: 'மேம்பட்ட' },
};

export function translate(key: string, lang: Lang): string {
  return t[key]?.[lang] ?? t[key]?.en ?? key;
}
