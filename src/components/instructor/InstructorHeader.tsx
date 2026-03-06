'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Menu, Check, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getNotifications, markAsRead, markAllAsRead } from '@/lib/actions/notifications';
import { cn } from '@/lib/utils';

interface InstructorHeaderProps {
  profile: any;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

export default function InstructorHeader({
  profile,
  approvalStatus,
}: InstructorHeaderProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (profile?.id) {
      getNotifications(profile.id, 'all').then((data) => {
        setNotifications(data.slice(0, 10));
        setUnreadCount(data.filter((n: any) => !n.is_read).length);
      });
    }
  }, [profile?.id]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotifClick = async (notif: any) => {
    if (!notif.is_read) {
      await markAsRead(notif.id, profile.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setShowNotifs(false);
    if (notif.link) router.push(notif.link);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead(profile.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 z-10">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 text-gray-500">
          <Menu size={20} />
        </button>
        <h1 className="text-gray-900 font-semibold text-sm">Instructor Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors relative"
            onClick={() => setShowNotifs((v) => !v)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="font-semibold text-sm text-gray-900">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-black hover:text-gray-600 flex items-center gap-1"
                  >
                    <Check size={12} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-sm">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={cn(
                        'w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0',
                        !n.is_read && 'bg-gray-50'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {!n.is_read && (
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-black flex-shrink-0" />
                        )}
                        <div className={cn('flex-1', n.is_read && 'pl-4')}>
                          <p className="text-xs font-semibold text-gray-900 leading-snug">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(n.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {n.link && <ExternalLink size={12} className="text-gray-300 mt-1 flex-shrink-0" />}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <Link href="/instructor/settings" className="hover:ring-2 hover:ring-black rounded-full transition-all">
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-black text-white text-[10px]">
              {profile.full_name?.split(' ').map((n: string) => n[0]).join('') || 'I'}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
