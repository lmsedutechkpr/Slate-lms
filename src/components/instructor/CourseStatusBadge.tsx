import React from 'react';
import { FileEdit, Clock, CheckCircle2, XCircle, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, any> = {
  draft: {
    label: 'Draft',
    icon: FileEdit,
    className: 'bg-gray-100 text-gray-600 border-gray-200'
  },
  pending_review: {
    label: 'Under Review',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  published: {
    label: 'Published',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200'
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    className: 'bg-gray-100 text-gray-500 border-gray-200'
  }
};

export default function CourseStatusBadge({ status, size = 'sm' }: CourseStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <div className={cn(
      'rounded-full border px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1.5',
      config.className,
      size === 'md' ? 'px-3 py-1.5 text-xs' : ''
    )}>
      <Icon size={size === 'md' ? 14 : 12} />
      <span>{config.label}</span>
    </div>
  );
}
