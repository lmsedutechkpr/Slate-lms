'use client';

import { useState, useTransition } from 'react';
import { Notification } from '@/types';
import { 
  BellOff, 
  CheckCheck, 
  Trash2, 
  BookOpen, 
  ShoppingBag, 
  Info, 
  Video, 
  Trophy, 
  Clock, 
  X,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  deleteAllRead 
} from '@/lib/actions/notifications';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/lib/i18n';

interface NotificationPageClientProps {
  initialNotifications: Notification[];
  userId: string;
  stats: {
    total: number;
    unread: number;
    byType: Record<string, number>;
  };
}

const ICON_MAP: Record<string, any> = {
  course: BookOpen,
  order: ShoppingBag,
  system: Info,
  live_class: Video,
  achievement: Trophy,
  enrollment: BookOpen,
  purchase: ShoppingBag,
};

const COLOR_MAP: Record<string, string> = {
  course: 'bg-blue-50 text-blue-600',
  order: 'bg-green-50 text-green-600',
  system: 'bg-gray-100 text-gray-600',
  live_class: 'bg-red-50 text-red-600',
  achievement: 'bg-amber-50 text-amber-600',
  enrollment: 'bg-blue-50 text-blue-600',
  purchase: 'bg-green-50 text-green-600',
};

export function NotificationPageClient({
  initialNotifications,
  userId,
  stats,
}: NotificationPageClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { t } = useTranslation(user?.preferred_language || 'en');
  const filter = searchParams.get('filter') || 'all';

  const handleMarkAllRead = async () => {
    startTransition(async () => {
      await markAllAsRead(userId);
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    });
  };

  const handleDeleteAllRead = async () => {
    startTransition(async () => {
      await deleteAllRead(userId);
      setNotifications(notifications.filter(n => !n.is_read));
    });
  };

  const handleDelete = async (id: string) => {
    // Optimistic UI
    const previous = [...notifications];
    setNotifications(notifications.filter(n => n.id !== id));
    
    try {
      await deleteNotification(id, userId);
    } catch (err) {
      setNotifications(previous);
    }
  };

  const handleItemClick = async (notification: Notification) => {
    if (!notification.is_read) {
      startTransition(async () => {
        await markAsRead(notification.id, userId);
        setNotifications(notifications.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
      });
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  return (
    <div className="-m-4 lg:-m-8 min-h-screen bg-gray-50/30">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <Link href="/dashboard" className="hover:text-gray-900">{t('common.dashboard')}</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900">{t('notifications.title')}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('notifications.title')}</h1>
            {stats.unread > 0 && (
              <span className="bg-black text-white rounded-full px-2.5 py-1 text-xs font-bold">
                {stats.unread}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {stats.unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CheckCheck size={14} />
                {t('notifications.markAllRead')}
              </button>
            )}
            {notifications.some(n => n.is_read) && (
              <button
                onClick={handleDeleteAllRead}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
                {t('notifications.deleteAllRead')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-100 px-8">
        <div className="flex gap-8">
          {[
            { id: 'all', label: t('notifications.all'), count: stats.total },
            { id: 'unread', label: t('notifications.unread'), count: stats.unread },
            { id: 'read', label: t('notifications.read'), count: stats.total - stats.unread },
          ].map((tab) => (
            <Link
              key={tab.id}
              href={tab.id === 'all' ? '/dashboard/notifications' : `/dashboard/notifications?filter=${tab.id}`}
              className={cn(
                'py-4 text-sm font-medium border-b-2 transition-all relative',
                filter === tab.id
                  ? 'text-gray-900 border-black'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              )}
            >
              {tab.label}
              <span className="ml-2 text-[10px] font-bold opacity-60">({tab.count})</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <div className="px-8 py-8 max-w-3xl">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-dashed border-gray-200 rounded-2xl">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <BellOff size={32} className="text-gray-200" />
            </div>
            <h2 className="text-gray-900 font-semibold text-lg">
              {filter === 'unread' ? t('notifications.markAllRead') : filter === 'read' ? 'No read notifications' : t('notifications.noNotifications')}
            </h2>
            <p className="text-gray-400 text-sm mt-1 max-w-xs">
              {filter === 'unread'
                ? 'No unread notifications at the moment.'
                : filter === 'read'
                ? 'You have not read any notifications yet.'
                : "You'll see course updates, order confirmations, and more here."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredNotifications.map((notification) => {
              const Icon = ICON_MAP[notification.type] || Info;
              const colorClass = COLOR_MAP[notification.type] || 'bg-gray-100 text-gray-600';

              return (
                <div
                  key={notification.id}
                  onClick={() => handleItemClick(notification)}
                  className={cn(
                    'group relative bg-white border rounded-xl p-5 flex gap-4 cursor-pointer transition-all hover:bg-gray-50/50',
                    notification.is_read
                      ? 'border-gray-100 opacity-80'
                      : 'border-gray-200 border-l-4 border-l-black shadow-sm'
                  )}
                >
                  {/* Type Icon */}
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', colorClass)}>
                    <Icon size={20} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className={cn('text-sm font-bold leading-none', notification.is_read ? 'text-gray-600' : 'text-gray-900')}>
                        {notification.title}
                      </h3>
                    </div>
                    <p className="text-gray-500 text-sm mt-1.5 line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-4">
                       <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-medium">
                          <Clock size={12} />
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                       </div>
                       {notification.link && (
                         <span className="text-gray-900 text-[11px] font-bold underline">
                           {t('notifications.viewDetail')} →
                         </span>
                       )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col items-end gap-2">
                    {!notification.is_read && (
                      <div className="w-2.5 h-2.5 bg-black rounded-full" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
