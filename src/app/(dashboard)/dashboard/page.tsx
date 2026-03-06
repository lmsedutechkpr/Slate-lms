import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getDashboardData } from '@/lib/actions/dashboard';
import { getRecommendedCourses } from '@/lib/actions/courses';
import { getRecentActivity } from '@/lib/actions/activity';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { ContinueLearning } from '@/components/dashboard/ContinueLearning';
import { RecommendedCourses } from '@/components/dashboard/RecommendedCourses';
import { RecommendedProducts } from '@/components/dashboard/RecommendedProducts';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { getRecommendedProducts } from '@/lib/actions/products';

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/onboarding');

  const [dashData, recentActivity] = await Promise.all([
    getDashboardData(),
    getRecentActivity(8),
  ]);

  if (!dashData) redirect('/login');

  const { stats, latestEnrollment, enrolledCourseIds } = dashData;

  const recommendedCourses = await getRecommendedCourses(
    profile.interests || [],
    enrolledCourseIds
  );

  const recommendedProducts = await getRecommendedProducts(
    profile.interests || [],
    enrolledCourseIds
  );

  return (
    <div className="space-y-10 pb-20">
      <WelcomeBanner user={profile} stats={stats} />
      <StatsRow stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <ContinueLearning enrollment={latestEnrollment} />
          <RecommendedCourses
            courses={recommendedCourses}
            interests={profile.interests || []}
          />
          <RecommendedProducts products={recommendedProducts} />
        </div>
        <div>
          <ActivityFeed activities={recentActivity} />
        </div>
      </div>
    </div>
  );
}
