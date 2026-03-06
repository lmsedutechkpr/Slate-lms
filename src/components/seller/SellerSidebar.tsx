'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  DollarSign,
  PlusCircle,
  ClipboardList,
  Star,
  Bell,
  Store,
  Settings,
  ArrowLeft,
  LogOut,
  Clock,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logout } from '@/lib/actions/auth';

interface SellerSidebarProps {
  profile: any;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

const navItems = [
  {
    label: 'MAIN',
    items: [
      { label: 'Dashboard', href: '/seller', icon: LayoutDashboard },
      { label: 'My Products', href: '/seller/products', icon: Package },
      { label: 'Orders', href: '/seller/orders', icon: ShoppingBag, hasBadge: true },
      { label: 'Earnings', href: '/seller/earnings', icon: DollarSign },
    ],
  },
  {
    label: 'STORE',
    items: [
      {
        label: 'Add Product',
        href: '/seller/products/add',
        icon: PlusCircle,
        isCTA: true,
      },
      { label: 'Inventory', href: '/seller/inventory', icon: ClipboardList },
      { label: 'Reviews', href: '/seller/reviews', icon: Star },
      { label: 'Notifications', href: '/seller/notifications', icon: Bell, hasBadge: true },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { label: 'Store Profile', href: '/seller/profile', icon: Store },
      { label: 'Settings', href: '/seller/settings', icon: Settings },
    ],
  },
];

export default function SellerSidebar({
  profile,
  approvalStatus,
}: SellerSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col h-screen">
      {/* Header */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="font-bold text-xl tracking-tight">SLATE</span>
        </Link>
        <div className="bg-gray-100 text-gray-500 text-[10px] uppercase tracking-widest rounded-full px-2.5 py-1 inline-block">
          SELLER PORTAL
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-6 mb-6">
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-emerald-900 text-white text-xs">
              {profile.store_name?.split(' ').map((n: string) => n[0]).join('') || profile.full_name?.split(' ').map((n: string) => n[0]).join('') || 'S'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <h3 className="text-sm font-bold text-gray-900 truncate">
              {profile.store_name || profile.full_name}
            </h3>
            <div className="inline-block bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded leading-none mt-1 uppercase">
              SELLER
            </div>
          </div>
        </div>

        {/* Approval Indicators */}
        {approvalStatus === 'pending' && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Clock size={14} />
              <span className="text-xs font-medium">Pending Approval</span>
            </div>
            <p className="text-amber-600 text-[11px]">
              Admin is reviewing your store account
            </p>
          </div>
        )}

        {approvalStatus === 'rejected' && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <XCircle size={14} />
              <span className="text-xs font-medium">Account Rejected</span>
            </div>
            <p className="text-red-600 text-[11px]">
              Contact support for more info
            </p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6">
        {navItems.map((section) => (
          <div key={section.label}>
            <p className="px-2 text-[10px] font-bold text-gray-400 tracking-widest mb-2">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group',
                      (item as any).isCTA
                        ? 'bg-black text-white hover:bg-gray-800 shadow-sm mt-2'
                        : isActive
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <Icon size={18} className={cn((item as any).isCTA ? 'text-white' : isActive ? 'text-emerald-700' : '')} />
                    <span className="flex-1">{item.label}</span>
                    {item.hasBadge && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-gray-400 text-xs hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Student View</span>
        </Link>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2 px-3 py-2 text-red-500 text-xs hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
