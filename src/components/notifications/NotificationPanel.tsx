'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  BellOff,
  X,
  Clock,
  ArrowRight,
  BookOpen,
  Unlock,
  Award,
  Megaphone,
  Settings,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Notification, NotificationType } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { markAsRead, markAllAsRead } from '@/lib/actions/notifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

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

type TabFilter = 'all' | 'unread' | 'read';

interface NotificationPanelProps {
  userId: string;
  initialUnreadCount: number;
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange: (count: number) => void;
}

export function NotificationPanel({
  userId,
  initialUnreadCount,
  isOpen,
  onClose,
  onUnreadCountChange,
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const fetchNotifications = useCallback(
    async (filter: TabFilter) => {
      setLoading(true);
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (filter === 'unread') query = query.eq('is_read', false);
      if (filter === 'read') query = query.eq('is_read', true);
      const { data } = await query;
      setNotifications((data ?? []) as Notification[]);
      setLoading(false);
    },
    [userId, supabase]
  );

  // Fetch when panel opens or tab changes
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(activeTab);
    }
  }, [isOpen, activeTab, fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => {
            const next = prev + 1;
            onUnreadCountChange(next);
            return next;
          });
          toast(newNotif.title, {
            description: newNotif.message,
            icon: <Bell size={14} />,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, onUnreadCountChange]);

  const handleMarkAsRead = async (notif: Notification) => {
    if (notif.is_read) return;
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => {
      const next = Math.max(0, prev - 1);
      onUnreadCountChange(next);
      return next;
    });
    await markAsRead(notif.id, userId);
    if (notif.link) {
      onClose();
      router.push(notif.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    onUnreadCountChange(0);
    await markAllAsRead(userId);
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.is_read;
    if (activeTab === 'read') return n.is_read;
    return true;
  });

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
          side="right"
          className="w-[380px] sm:w-[380px] p-0 flex flex-col [&>button]:hidden"
        >
          <SheetTitle className="sr-only">Notifications</SheetTitle>
          {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <Bell size={18} className="text-gray-700" />
            <span className="text-gray-900 font-semibold ml-2 text-sm">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="ml-2 min-w-[20px] h-5 px-1.5 bg-black text-white rounded-full text-xs font-bold flex items-center justify-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-gray-500 text-xs font-medium hover:text-gray-900 transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors text-gray-500"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center px-5 py-2 border-b border-gray-100 flex-shrink-0 gap-1">
          {(['all', 'unread', 'read'] as TabFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-3 py-1.5 text-sm capitalize transition-colors border-b-2',
                activeTab === tab
                  ? 'text-gray-900 font-semibold border-black'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <BellOff size={36} className="text-gray-200 mb-3" />
              <p className="text-gray-500 text-sm font-medium">No notifications yet</p>
              <p className="text-gray-400 text-xs mt-1">
                {activeTab === 'unread' ? 'All caught up!' : "You'll see updates here"}
              </p>
            </div>
          ) : (
            <div>
              {filtered.map((notif) => {
                const Icon = ICON_MAP[notif.type] ?? Bell;
                const colorClass = COLOR_MAP[notif.type] ?? 'bg-gray-100 text-gray-600';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkAsRead(notif)}
                    className={cn(
                      'flex gap-3 px-5 py-4 border-b border-gray-50 last:border-0 cursor-pointer transition-colors',
                      notif.is_read ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
                        colorClass
                      )}
                    >
                      <Icon size={16} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm font-medium line-clamp-1 leading-snug">
                        {notif.title}
                      </p>
                      {notif.message && (
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      )}
                      <p className="text-gray-400 text-[11px] mt-1.5 flex items-center gap-1">
                        <Clock size={10} />
                        {formatDistanceToNow(new Date(notif.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-black rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0">
          <Link
            href="/dashboard/notifications"
            onClick={onClose}
            className="flex items-center justify-center gap-1 text-gray-600 text-sm hover:text-gray-900 transition-colors"
          >
            View all notifications
            <ArrowRight size={14} />
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
