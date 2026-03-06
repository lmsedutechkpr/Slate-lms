'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookMarked,
  BookOpen,
  ShoppingBag,
  Package,
  Heart,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Profile } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { SidebarCartItem } from '@/components/shared/SidebarCartItem';
import { useTranslation } from '@/lib/i18n';

interface SidebarProps {
  user: Profile | null;
  className?: string;
  cartCount?: number;
}

export function Sidebar({ user, className }: SidebarProps) {
  const pathname = usePathname();
  const supabase = createClient();
  const clearUser = useAuthStore((state) => state.clearUser);
  const router = useRouter();
  const { t } = useTranslation(user?.preferred_language || 'en');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUser();
    router.push('/');
  };

  const initial =
    user?.full_name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    'S';
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Student';

  const menuItems = [
    { label: t('common.dashboard'), icon: LayoutDashboard, href: '/dashboard' },
    { label: t('myCourses.title'), icon: BookMarked, href: '/dashboard/my-courses' },
    { label: t('courses.exploreCourses'), icon: BookOpen, href: '/courses' },
    { label: t('shop.title'), icon: ShoppingBag, href: '/shop' },
    { label: t('common.cart'), type: 'cart' },
    { label: t('orders.title'), icon: Package, href: '/dashboard/orders' },
    { label: t('common.wishlist'), icon: Heart, href: '/dashboard/wishlist' },
    { label: t('common.progress'), icon: BarChart3, href: '/dashboard/progress' },
    { label: t('notifications.title'), icon: Bell, href: '/dashboard/notifications' },
    { label: t('common.profile'), icon: UserCircle, href: '/dashboard/profile' },
    { label: t('common.settings'), icon: Settings, href: '/dashboard/settings' },
  ];

  return (
    <div className={cn('flex flex-col h-full bg-white border-r border-gray-200', className)}>
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">S</span>
          </div>
          <span className="text-black font-semibold text-sm tracking-[0.12em] uppercase ml-0.5">
            SLATE
          </span>
        </Link>
      </div>

      {/* User Card */}
      <div className="mx-3 mt-3 mb-2">
        <div className="flex items-center gap-2.5 px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-black flex items-center justify-center">
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={displayName}
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-sm">{initial}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 text-sm font-medium truncate leading-tight max-w-[120px]">
              {displayName.length > 18 ? displayName.slice(0, 18) + '\u2026' : displayName}
            </p>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              Student
            </span>
          </div>
        </div>
      </div>

      {/* Menu Label */}
      <p className="px-4 pt-4 pb-1 text-[10px] text-gray-400 font-medium tracking-[0.12em] uppercase">
        {t('common.menu')}
      </p>

      {/* Nav Items */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.map((item, idx) => {
          if (item.type === 'cart') {
            return <SidebarCartItem key="cart-nav-item" />;
          }

          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href || '');

          return (
            <Link
              key={item.href || idx}
              href={item.href || '#'}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-100',
                isActive
                  ? 'bg-black text-white font-medium'
                  : 'text-gray-500 font-normal hover:bg-gray-50 hover:text-gray-800'
              )}
            >
              {item.icon && (
                <item.icon
                  className={cn('flex-shrink-0', isActive ? 'text-white' : 'text-gray-400')}
                  size={18}
                />
              )}
              <span className="truncate flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Divider + Logout */}
      <div className="border-t border-gray-100 mx-3 mt-2" />
      <div className="p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-normal text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-100"
        >
          <LogOut size={18} className="flex-shrink-0 text-gray-400" />
          <span>{t('common.logout')}</span>
        </button>
      </div>
    </div>
  );
}
