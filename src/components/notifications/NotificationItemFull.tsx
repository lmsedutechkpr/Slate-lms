'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Unlock,
  Award,
  Megaphone,
  Settings,
  Bell,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Notification, NotificationType } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const ICON_MAP: Record<NotificationType, React.ElementType> = {
  enrollment: BookOpen,
  lecture_unlock: Unlock,
  course_complete: Award,
  new_course: Bell,
  promotional: Megaphone,
  system: Settings,
};

const COLOR_MAP: Record<NotificationType, string> = {
  enrollment: 'bg-blue-50 text-blue-600',
  lecture_unlock: 'bg-purple-50 text-purple-600',
  course_complete: 'bg-emerald-50 text-emerald-600',
  new_course: 'bg-indigo-50 text-indigo-600',
  promotional: 'bg-amber-50 text-amber-600',
  system: 'bg-gray-100 text-gray-600',
};

interface Props {
  notification: Notification;
}

export function NotificationItemFull({ notification }: Props) {
  const [read, setRead] = useState(notification.is_read);
  const router = useRouter();
  const Icon = ICON_MAP[notification.type] ?? Bell;
  const colorClass = COLOR_MAP[notification.type] ?? 'bg-gray-100 text-gray-600';

  const markRead = async () => {
    if (read) return;
    setRead(true);
    const supabase = createClient();
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notification.id);
    router.refresh();
  };

  const inner = (
    <div
      onClick={markRead}
      className={cn(
        'bg-white border border-gray-200 rounded-xl flex gap-4 p-5 cursor-pointer transition-all hover:shadow-sm border-l-4',
        read ? 'border-l-transparent' : 'border-l-black'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          colorClass
        )}
      >
        <Icon size={18} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-base font-semibold leading-snug', read ? 'text-gray-700' : 'text-gray-900')}>
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-gray-600 text-sm mt-1 leading-relaxed">{notification.message}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <p className="text-gray-400 text-xs flex items-center gap-1">
            <Clock size={11} />
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
          {notification.link && (
            <span className="text-gray-900 text-xs font-medium flex items-center gap-0.5">
              View <ArrowRight size={12} />
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={markRead} className="block">
        {inner}
      </Link>
    );
  }

  return inner;
}
