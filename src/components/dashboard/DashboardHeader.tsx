'use client';

import { Search, Bell, Menu } from 'lucide-react';
import { Profile } from '@/types';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CartBadge } from '@/components/shared/CartBadge';

interface DashboardHeaderProps {
  user: Profile | null;
  onMenuClick: () => void;
  cartCount?: number;
  unreadCount?: number;
  onNotificationClick?: () => void;
}

export function DashboardHeader({
  user,
  onMenuClick,
  unreadCount = 0,
  onNotificationClick,
}: DashboardHeaderProps) {
  const [search, setSearch] = useState('');
  const router = useRouter();

  return (
    <header className="h-16 px-4 lg:px-6 bg-white border-b border-gray-200 flex items-center gap-4 sticky top-0 z-30">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-all"
      >
        <Menu size={20} />
      </button>

      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && router.push(`/courses?q=${search}`)}
            className="pl-9 h-9 bg-gray-50 border-gray-200 focus:bg-white focus:border-gray-900 focus-visible:ring-2 focus-visible:ring-black/5 rounded-full text-sm font-normal placeholder:text-gray-400 text-gray-900 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Cart */}
        <CartBadge />

        {/* Notifications Bell */}
        <button
          onClick={onNotificationClick}
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-all"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
