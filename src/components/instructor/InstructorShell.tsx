'use client';

import React from 'react';
import InstructorSidebar from './InstructorSidebar';
import InstructorHeader from './InstructorHeader';

interface InstructorShellProps {
  profile: any;
  children: React.ReactNode;
}

export default function InstructorShell({
  profile,
  children,
}: InstructorShellProps) {
  const approvalStatus = profile?.approval_status || 'pending';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <InstructorSidebar
        profile={profile}
        approvalStatus={approvalStatus}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <InstructorHeader
          profile={profile}
          approvalStatus={approvalStatus}
        />
        <main className="flex-1 overflow-y-auto min-h-0 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
