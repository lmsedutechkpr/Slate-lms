import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  getProgressOverview,
  getCourseProgress,
  getWeeklyActivity,
  getQuizHistory,
  getCertificates,
} from '@/lib/actions/progress';
import { ProgressStatsGrid } from '@/components/progress/ProgressStatsGrid';
import { WeeklyActivityChart } from '@/components/progress/WeeklyActivityChart';
import { ProgressTabs } from '@/components/progress/ProgressTabs';
import { Profile } from '@/types';

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profileData) redirect('/onboarding');

  const profile = profileData as Profile;

  const [overview, courseProgress, weeklyActivity, quizHistory, certificates] =
    await Promise.all([
      getProgressOverview(profile.id),
      getCourseProgress(profile.id),
      getWeeklyActivity(profile.id),
      getQuizHistory(profile.id),
      getCertificates(profile.id),
    ]);

  return (
    <div className="-m-4 lg:-m-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-6">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-gray-700 transition-colors">
            Dashboard
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-900">Progress</span>
        </div>
        <div className="mt-2">
          <h1 className="text-gray-900 font-bold text-2xl tracking-tight">My Progress</h1>
          <p className="mt-1 text-gray-500 text-sm">
            Track your learning journey across all courses
          </p>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8 space-y-8">
        {/* Stats */}
        <ProgressStatsGrid
          totalEnrolled={overview.totalEnrolled}
          totalCompleted={overview.totalCompleted}
          totalInProgress={overview.totalInProgress}
          totalWatchMinutes={overview.totalWatchMinutes}
          certificateCount={overview.certificateCount}
          currentStreak={overview.currentStreak}
          longestStreak={overview.longestStreak}
          avgQuizScore={overview.avgQuizScore}
        />

        {/* Weekly Activity */}
        <WeeklyActivityChart data={weeklyActivity} />

        {/* Tabbed content */}
        <ProgressTabs
          courseProgress={courseProgress}
          quizHistory={quizHistory}
          certificates={certificates}
          lang={profile.preferred_language}
        />
      </div>
    </div>
  );
}
