'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Check, ExternalLink, Menu } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead } from '@/lib/actions/notifications';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  profile: any;
  onMenuClick?: () => void;
}

export default function AdminHeader({ profile, onMenuClick }: AdminHeaderProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (profile?.id) {
      getNotifications(profile.id, 'all').then((data) => {
        setNotifications(data.slice(0, 10));
        setUnreadCount(data.filter((n) => !n.is_read).length);
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
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between flex-shrink-0">
      {/* Page title & Hamburger */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="md:hidden p-1.5 -ml-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-gray-500 text-sm font-medium">
          Admin Panel
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">

        {/* Notification bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="relative p-2 rounded-xl hover:bg-gray-100 transition-all duration-150"
            onClick={() => setShowNotifs((v) => !v)}
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
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
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
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
                        'w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 relative',
                        !n.is_read && 'bg-blue-50/30'
                      )}
                    >
                      {!n.is_read && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                      <div className={cn("flex-1", !n.is_read && "pl-2")}>
                        <p className={cn("text-xs leading-snug", !n.is_read ? "font-bold text-gray-900" : "font-semibold text-gray-700")}>{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(n.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {n.link && <ExternalLink size={12} className="text-gray-300 mt-1 flex-shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin avatar */}
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-gray-200 transition-all">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="Profile" />
          ) : (
            <span className="text-white text-xs font-bold">
              {profile?.full_name?.[0]?.toUpperCase() ?? 'A'}
            </span>
          )}
        </div>

      </div>
    </header>
  );
}
