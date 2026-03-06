'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  Tag,
  Settings,
  ArrowLeft,
  LucideIcon,
  ShoppingBag,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart,
  Bell,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  profile: any;
  pendingCourses?: number;
  pendingInstructors?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

function AdminNavItem({
  href, icon: Icon, label, badge, pathname, onClick
}: {
  href: string
  icon: LucideIcon
  label: string
  badge?: number
  pathname: string
  onClick?: () => void
}) {
  const isActive = pathname === href ||
    (href !== '/admin/dashboard' &&
     pathname.startsWith(href))

  return (
    <Link href={href} onClick={onClick}>
      <div className={`flex items-center justify-between
                        px-3 py-2.5 rounded-xl mb-0.5
                        transition-all cursor-pointer
                        ${isActive
                          ? 'bg-black text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}>
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        {(badge ?? 0) > 0 && (
          <span className={`text-[10px] font-bold rounded-full
                             min-w-[18px] h-[18px] flex items-center
                             justify-center px-1
                             ${isActive
                               ? 'bg-white text-black'
                               : 'bg-amber-500 text-white'
                             }`}>
            {badge}
          </span>
        )}
      </div>
    </Link>
  )
}

export default function AdminSidebar({
  profile,
  pendingCourses = 0,
  pendingInstructors = 0,
  isOpen = false,
  onClose
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden flex-shrink-0 transition-transform duration-300 ease-in-out md:static md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* LOGO */}
        <div className="px-5 py-5 border-b border-gray-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-black rounded-lg
                               flex items-center justify-center">
                <span className="text-white font-black text-sm">S</span>
              </div>
              <span className="text-gray-900 font-bold text-lg
                                tracking-tight">
                SLATE
              </span>
            </div>
            <div className="mt-2.5">
              <span className="bg-red-50 text-red-600 text-[10px]
                                font-bold uppercase tracking-widest
                                rounded-md px-2 py-1 border
                                border-red-100">
                Admin Panel
              </span>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-900">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ADMIN PROFILE */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                className="w-9 h-9 rounded-full object-cover
                            ring-2 ring-gray-100"
                alt="Avatar"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-black
                               flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {profile?.full_name?.[0]?.toUpperCase() ?? 'A'}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-gray-900 text-sm font-semibold
                             truncate">
                {profile?.full_name || 'Admin'}
              </p>
              <span className="bg-red-50 text-red-600 text-[10px]
                                font-bold uppercase tracking-wide
                                rounded px-1.5 py-0.5 border
                                border-red-100">
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">

          <p className="text-gray-400 text-[10px] font-bold
                         uppercase tracking-widest px-3 mb-2">
            Overview
          </p>

          <AdminNavItem
            href="/admin/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            pathname={pathname}
            onClick={onClose}
          />

          <p className="text-gray-400 text-[10px] font-bold
                         uppercase tracking-widest px-3 mt-5 mb-2">
            Content
          </p>

          <AdminNavItem
            href="/admin/courses"
            icon={BookOpen}
            label="Courses"
            badge={pendingCourses}
            pathname={pathname}
            onClick={onClose}
          />

          <AdminNavItem
            href="/admin/instructors"
            icon={GraduationCap}
            label="Instructors"
            badge={pendingInstructors}
            pathname={pathname}
            onClick={onClose}
          />

          <AdminNavItem
            href="/admin/sellers"
            icon={ShoppingBag}
            label="Sellers"
            pathname={pathname}
            onClick={onClose}
          />

          <AdminNavItem
            href="/admin/products"
            icon={Package}
            label="Products"
            pathname={pathname}
            onClick={onClose}
          />

          <AdminNavItem
            href="/admin/students"
            icon={Users}
            label="Students"
            pathname={pathname}
            onClick={onClose}
          />

          <p className="text-gray-400 text-[10px] font-bold
                         uppercase tracking-widest px-3 mt-5 mb-2">
            Platform
          </p>

          <AdminNavItem
            href="/admin/orders"
            icon={ShoppingCart}
            label="Orders"
            pathname={pathname}
            onClick={onClose}
          />

          <AdminNavItem
            href="/admin/earnings"
            icon={DollarSign}
            label="Earnings"
            pathname={pathname}
            onClick={onClose}
          />

          <AdminNavItem
            href="/admin/reports"
            icon={BarChart}
            label="Reports"
            pathname={pathname}
            onClick={onClose}
          />

          <AdminNavItem
            href="/admin/categories"
            icon={Tag}
            label="Categories"
            pathname={pathname}
            onClick={onClose}
          />

          <AdminNavItem
            href="/admin/notifications"
            icon={Bell}
            label="Notifications"
            pathname={pathname}
            onClick={onClose}
          />

          <AdminNavItem
            href="/admin/settings"
            icon={Settings}
            label="Settings"
            pathname={pathname}
            onClick={onClose}
          />

        </nav>

        {/* BOTTOM */}
        <div className="px-3 py-4 border-t border-gray-100
                         space-y-1">
          <Link href="/dashboard" onClick={onClose}>
            <div className="flex items-center gap-2.5 px-3 py-2.5
                             rounded-xl text-gray-500
                             hover:bg-gray-100 hover:text-gray-900
                             transition-all cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">
                Exit Admin
              </span>
            </div>
          </Link>
        </div>

      </aside>
    </>
  );
}
