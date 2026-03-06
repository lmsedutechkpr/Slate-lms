'use client';

import React from 'react';
import { Users, BookOpen, TrendingUp, DollarSign, Star, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: any;
  value: string | number;
  label: string;
  footer: string;
  footerColor?: string;
}

function StatCard({ icon: Icon, value, label, footer, footerColor = 'text-gray-400' }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
          <Icon size={20} />
        </div>
      </div>
      <div>
        <h4 className="text-2xl font-bold text-gray-900 mb-1">{value}</h4>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">{label}</p>
      </div>
      <div className={cn('mt-4 pt-4 border-t border-gray-50 text-xs font-medium', footerColor)}>
        {footer}
      </div>
    </div>
  );
}

interface InstructorStatsRowProps {
  stats: any;
}

export default function InstructorStatsRow({ stats }: InstructorStatsRowProps) {
  const {
    totalStudents = 0,
    thisMonthStudents = 0,
    totalCourses = 0,
    publishedCourses = 0,
    totalRevenue = 0,
    thisMonthRevenue = 0,
    netRevenue = 0,
    avgRating = 0,
    totalReviews = 0,
    pendingReviewCourses = 0
  } = stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8 px-8">
      <StatCard
        icon={Users}
        value={totalStudents.toLocaleString()}
        label="Total Students"
        footer={`+${thisMonthStudents} this month`}
        footerColor="text-emerald-600"
      />
      <StatCard
        icon={BookOpen}
        value={totalCourses}
        label="Total Courses"
        footer={`${publishedCourses} published`}
        footerColor="text-gray-400"
      />
      <StatCard
        icon={TrendingUp}
        value={`₹${totalRevenue.toLocaleString('en-IN')}`}
        label="Gross Revenue"
        footer={`₹${thisMonthRevenue.toLocaleString('en-IN')} this month`}
        footerColor="text-emerald-600"
      />
      <StatCard
        icon={DollarSign}
        value={`₹${netRevenue.toLocaleString('en-IN')}`}
        label="Net Earnings (70%)"
        footer="After 30% platform fee"
        footerColor="text-gray-400"
      />
      <StatCard
        icon={Star}
        value={avgRating > 0 ? avgRating.toFixed(1) : '—'}
        label="Avg Rating"
        footer={`${totalReviews} reviews`}
        footerColor="text-amber-500"
      />
      {pendingReviewCourses > 0 && (
        <StatCard
          icon={Clock}
          value={pendingReviewCourses}
          label="Awaiting Review"
          footer="Submitted to admin"
          footerColor="text-amber-600"
        />
      )}
    </div>
  );
}
