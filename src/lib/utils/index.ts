// Currency formatter — INR
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
// formatCurrency(1299) → "₹1,299"

// Time ago formatter
export function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  }).format(new Date(date));
}

// Format date for display
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  }).format(new Date(date));
}

// Greeting by time
export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// Tamil greeting
export function getGreetingTa(): string {
  const h = new Date().getHours();
  if (h < 12) return 'காலை வணக்கம்';
  if (h < 17) return 'மதிய வணக்கம்';
  return 'மாலை வணக்கம்';
}

// Calculate discount percentage
export function calcDiscount(price: number, originalPrice: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

// Duration formatter
export function formatDuration(minutes: number): string {
  if (!minutes) return '0m';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
