'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { User, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RecentEnrollmentsProps {
  enrollments: any[];
}

export default function RecentEnrollments({ enrollments }: RecentEnrollmentsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h3 className="font-bold text-gray-900 text-sm">Recent Enrollments</h3>
        <Link href="/instructor/students" className="text-xs font-bold text-black border-b border-black">
          View All
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        {enrollments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <User size={24} />
            </div>
            <p className="text-sm text-gray-400 font-medium">No enrollments yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors group">
                <Avatar className="w-10 h-10 border border-white shadow-sm group-hover:scale-105 transition-transform">
                  <AvatarImage src={enrollment.student?.avatar_url} />
                  <AvatarFallback className="bg-black text-white text-[10px] font-bold">
                    {enrollment.student?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'S'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {enrollment.student?.full_name}
                    </h4>
                    <span className="text-[10px] font-medium text-gray-400">
                      {formatDistanceToNow(new Date(enrollment.enrolled_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate font-medium">
                    enrolled in <span className="text-black">{enrollment.course?.title}</span>
                  </p>
                </div>
                
                {enrollment.progress_percent > 0 && (
                  <div className="flex flex-col items-end gap-1.5 ml-2">
                    <span className="text-[10px] font-bold text-emerald-600">{enrollment.progress_percent}%</span>
                    <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${enrollment.progress_percent}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
