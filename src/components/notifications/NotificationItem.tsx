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
  CircleDot,
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

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const [read, setRead] = useState(notification.is_read);
  const router = useRouter();
  const Icon = ICON_MAP[notification.type] ?? Bell;
  const colorClass = COLOR_MAP[notification.type] ?? 'bg-gray-100 text-gray-600';

  const markRead = async () => {
    if (read) return;
    setRead(true);
    const supabase = createClient();
    await supabase.from('notifications').update({ is_read: true }).eq('id', notification.id);
    router.refresh();
  };

  const content = (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer',
        read
          ? 'bg-white border-gray-200 hover:bg-gray-50'
          : 'bg-blue-50/40 border-blue-100 hover:bg-blue-50/60'
      )}
      onClick={markRead}
    >
      {/* Icon */}
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colorClass)}>
        <Icon size={18} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-semibold leading-snug', read ? 'text-gray-700' : 'text-gray-900')}>
            {notification.title}
          </p>
          {!read && (
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
          )}
        </div>
        {notification.message && (
          <p className="text-sm text-gray-500 mt-0.5 leading-snug line-clamp-2">{notification.message}</p>
        )}
        <p className="text-xs text-gray-400 mt-1.5">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={markRead} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
