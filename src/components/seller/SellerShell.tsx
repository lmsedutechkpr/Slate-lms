'use client';

import React from 'react';
import SellerSidebar from './SellerSidebar';
import SellerHeader from './SellerHeader';

interface SellerShellProps {
  profile: any;
  children: React.ReactNode;
}

export default function SellerShell({
  profile,
  children,
}: SellerShellProps) {
  const approvalStatus = profile?.approval_status || 'pending';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SellerSidebar
        profile={profile}
        approvalStatus={approvalStatus}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SellerHeader
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
