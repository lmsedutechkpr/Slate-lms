import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceDisplay({ price, originalPrice, className, size = 'md' }: PriceDisplayProps) {
  if (price === 0) {
    return (
      <span className={cn(
        "inline-flex items-center bg-black text-white font-semibold rounded-full",
        size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs',
        className
      )}>
        Free
      </span>
    );
  }

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn(
        "font-bold text-gray-900",
        size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg'
      )}>
        ₹{price.toLocaleString('en-IN')}
      </span>
      {originalPrice && originalPrice > price && (
        <>
          <span className={cn(
            "text-gray-400 line-through",
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}>
            ₹{originalPrice.toLocaleString('en-IN')}
          </span>
          <span className={cn(
            "text-emerald-600 font-medium",
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}>
            {discount}% off
          </span>
        </>
      )}
    </div>
  );
}
