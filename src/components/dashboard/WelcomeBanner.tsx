'use client';

import { Sparkles, TrendingUp, BookOpen, ArrowRight } from 'lucide-react';
import { Profile, DashboardStats } from '@/types';
import Link from 'next/link';

interface WelcomeBannerProps {
  user: Profile | null;
  stats: DashboardStats;
}

export function WelcomeBanner({ user, stats }: WelcomeBannerProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.full_name?.split(' ')[0] || 'Learner';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black p-7 lg:p-10 text-white">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        {/* Left */}
          <div className="space-y-3">
              <div className="flex items-center gap-1.5 w-fit">
                <Sparkles size={11} className="text-white/40" />
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">
                  Learning Journey
                </span>
              </div>

              <div>
                <h1 className="text-2xl lg:text-3xl tracking-tight leading-tight">
                  <span className="text-white/60 font-normal">{getGreeting()},</span>{' '}
                  <span className="text-white font-semibold">{firstName}!</span>
                </h1>
                <p className="mt-1.5 text-white/50 text-sm font-normal max-w-md">
                  {stats.enrolled > 0
                    ? `You have ${stats.inProgress} course${stats.inProgress !== 1 ? 's' : ''} in progress. Keep it up!`
                    : 'Welcome to Slate! Explore courses and start learning today.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {stats.inProgress > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/8 rounded-lg border border-white/8 text-xs font-normal text-white/60">
                    <TrendingUp size={11} className="text-white/50" />
                    {stats.inProgress} in progress
                  </div>
                )}
                {stats.completed > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/8 rounded-lg border border-white/8 text-xs font-normal text-white/60">
                    <BookOpen size={11} className="text-white/50" />
                    {stats.completed} completed
                  </div>
                )}
                {stats.enrolled === 0 && (
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-all"
                  >
                    Browse Courses
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>
          </div>

        {/* Right: enrolled count box */}
        <div className="hidden lg:flex flex-col items-center gap-3">
          <div className="w-28 h-28 rounded-xl bg-white/8 border border-white/8 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold text-white">{stats.enrolled}</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/40 mt-1">
              Courses
            </span>
          </div>
          {stats.certificates > 0 && (
            <div className="px-3 py-1 bg-white/8 border border-white/8 rounded-lg">
              <span className="text-white/30 text-[9px] font-normal uppercase tracking-widest">
                {stats.certificates} Certificate{stats.certificates !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
