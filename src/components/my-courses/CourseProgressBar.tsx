'use client';

import { cn } from '@/lib/utils';

interface CourseProgressBarProps {
  percent: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

function getBarColor(percent: number) {
  if (percent === 0) return 'bg-gray-200';
  if (percent >= 100) return 'bg-emerald-500';
  return 'bg-black';
}

export function CourseProgressBar({
  percent,
  size = 'md',
  showLabel = false,
  className,
}: CourseProgressBarProps) {
  const clamped = Math.min(Math.max(percent, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('bg-gray-100 rounded-full overflow-hidden w-full', sizeClasses[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', getBarColor(clamped))}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-gray-600 text-xs mt-1 block">{clamped}%</span>
      )}
    </div>
  );
}
