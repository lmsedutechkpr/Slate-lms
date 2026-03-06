import {
  Headphones,
  PenTool,
  Zap,
  Package,
  Lightbulb,
  HardDrive,
  LucideIcon,
} from 'lucide-react';

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Headphones,
  PenTool,
  Zap,
  Package,
  Lightbulb,
  HardDrive,
};

export const CATEGORY_GRADIENT_MAP: Record<string, string> = {
  audio: 'from-violet-500 to-purple-700',
  writing: 'from-blue-500 to-indigo-600',
  power: 'from-amber-500 to-orange-600',
  accessories: 'from-gray-500 to-gray-700',
  lighting: 'from-yellow-400 to-amber-500',
  storage: 'from-teal-500 to-cyan-600',
  default: 'from-gray-400 to-gray-600',
};

export function getCategoryGradient(slug?: string | null): string {
  if (!slug) return CATEGORY_GRADIENT_MAP.default;
  return CATEGORY_GRADIENT_MAP[slug] ?? CATEGORY_GRADIENT_MAP.default;
}

export function getCategoryIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return Package;
  return CATEGORY_ICON_MAP[iconName] ?? Package;
}

export function formatPrice(price: number): string {
  return '₹' + price.toLocaleString('en-IN');
}

export function calcDiscount(price: number, originalPrice: number | null): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
