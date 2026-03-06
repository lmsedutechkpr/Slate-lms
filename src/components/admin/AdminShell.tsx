'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { createClient } from '@/lib/supabase/client';

interface AdminShellProps {
  profile: any;
  children: React.ReactNode;
  pendingCourses?: number;
  pendingInstructors?: number;
}

export default function AdminShell({ 
  profile, 
  children, 
  pendingCourses: initialPendingCourses = 0, 
  pendingInstructors: initialPendingInstructors = 0 
}: AdminShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingCourses, setPendingCourses] = useState(initialPendingCourses);
  const [pendingInstructors, setPendingInstructors] = useState(initialPendingInstructors);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchCounts = async () => {
      const [{ count: cCount }, { count: iCount }] = await Promise.all([
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['instructor', 'seller']).eq('approval_status', 'pending')
      ]);
      setPendingCourses(cCount ?? 0);
      setPendingInstructors(iCount ?? 0);
    };

    // 1. Pending approvals count (courses in_review)
    const coursesChannel = supabase.channel('pending-courses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
        fetchCounts();
      })
      .subscribe();

    // 2. Pending instructor/seller approvals
    const profilesChannel = supabase.channel('pending-profiles')
      .on('postgres_changes', { 
        event: '*', schema: 'public', table: 'profiles',
        filter: 'approval_status=eq.pending' 
      }, () => {
        fetchCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(coursesChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [supabase]);

  return (
    <div className="flex h-screen overflow-hidden relative">
      <AdminSidebar 
        profile={profile} 
        pendingCourses={pendingCourses} 
        pendingInstructors={pendingInstructors} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full h-full">
        <AdminHeader profile={profile} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto min-h-0 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
