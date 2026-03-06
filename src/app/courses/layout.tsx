'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // The course player is full-screen — bypass layout
  if (pathname.endsWith('/learn')) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-outfit">
      {/* Desktop Sidebar */}
      <Sidebar user={user} className="hidden lg:flex w-64 flex-shrink-0" />

      {/* Mobile Backdrop */}
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
            className="fixed inset-y-0 left-0 w-64 bg-slate-900 z-50 lg:hidden shadow-2xl"
          >
            <Sidebar user={user} className="w-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader user={user} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
