'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { useAuthStore } from '@/store/authStore';
import { useCartCount } from '@/hooks/useCartCount';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  initialUnreadCount: number;
  userId: string;
}

export default function DashboardLayoutClient({
  children,
  initialUnreadCount,
  userId,
}: DashboardLayoutClientProps) {
  const { user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const cartCount = useCartCount();

  return (
    <div className="flex h-screen bg-white overflow-hidden font-outfit">
      {/* Desktop Sidebar */}
      <Sidebar user={user} cartCount={cartCount} className="hidden lg:flex w-64 flex-shrink-0" />

      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-lg border-r border-gray-200"
          >
            <Sidebar user={user} cartCount={cartCount} className="w-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <DashboardHeader
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
          cartCount={cartCount}
          unreadCount={unreadCount}
          onNotificationClick={() => setIsNotifOpen(true)}
        />

        {/* This is the ONLY scroll container */}
        <main className="flex-1 overflow-y-auto bg-gray-50 scroll-smooth">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8 pb-12"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        userId={userId}
        initialUnreadCount={unreadCount}
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onUnreadCountChange={setUnreadCount}
      />
    </div>
  );
}
