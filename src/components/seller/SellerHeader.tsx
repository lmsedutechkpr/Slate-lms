'use client';

import React from 'react';
import { Bell, Menu, Search } from 'lucide-react';

interface SellerHeaderProps {
  profile: any;
  approvalStatus: string;
}

export default function SellerHeader({ profile, approvalStatus }: SellerHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 sticky top-0 md:static">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button - Optional later for responsive */}
        <button className="md:hidden text-gray-500 hover:text-gray-900">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative max-w-sm hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, orders..."
            className="w-64 pl-10 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm outline-none bg-gray-50 focus:bg-white focus:border-gray-300 transition-colors shadow-none"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 mr-2">
          {approvalStatus === 'approved' && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Store Active
            </span>
          )}
        </div>
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
        </button>
      </div>
    </header>
  );
}
