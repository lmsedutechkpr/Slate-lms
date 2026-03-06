import { createClient } from '@/lib/supabase/server';
import { getInstructorStats, getInstructorCourses, getEnrolledStudents } from '@/lib/actions/instructor';
import Link from 'next/link';
import { 
  Plus, 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Star, 
  ArrowRight, 
  BookPlus, 
  Clock, 
  XCircle, 
  Pencil,
  PlusCircle,
  Settings
} from 'lucide-react';
import { CourseThumbnail } from '@/components/shared/CourseThumbnail';
import CourseStatusBadge from '@/components/instructor/CourseStatusBadge';
import { formatRelativeTime } from '@/lib/utils';

export default async function InstructorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  const [stats, courses, enrollments] = await Promise.all([
    getInstructorStats(user.id),
    getInstructorCourses(user.id),
    getEnrolledStudents(user.id)
  ]);

  const {
    totalStudents = 0,
    thisMonthStudents = 0,
    totalCourses = 0,
    publishedCourses = 0,
    pendingReviewCourses = 0,
    totalRevenue = 0,
    netRevenue = 0,
    thisMonthRevenue = 0,
    avgRating = 0,
    totalReviews = 0
  } = stats;

  const recentEnrollments = enrollments.slice(0, 5);
  const firstName = profile.full_name?.split(' ')[0] || 'Instructor';
  
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';

  let subtitle = "";
  if (totalCourses === 0) {
    subtitle = "Start by creating your first course.";
  } else if (publishedCourses === 0) {
    subtitle = `You have ${totalCourses} draft course${totalCourses !== 1 ? 's' : ''}. Submit for review to go live.`;
  } else if (totalStudents === 0) {
    subtitle = "Your courses are live. Share them to get students!";
  } else {
    subtitle = `${totalStudents.toLocaleString()} students are learning from you.`;
  }

  const statCards = [
    {
      icon: Users,
      value: totalStudents.toLocaleString(),
      label: 'Total Students',
      sub: thisMonthStudents > 0
           ? `+${thisMonthStudents} this month`
           : 'No students yet',
      subColor: thisMonthStudents > 0
                ? 'text-emerald-600'
                : 'text-gray-400'
    },
    {
      icon: BookOpen,
      value: totalCourses,
      label: 'Total Courses',
      sub: `${publishedCourses} published`,
      subColor: 'text-gray-400'
    },
    {
      icon: TrendingUp,
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      label: 'Gross Revenue',
      sub: `₹${thisMonthRevenue.toLocaleString('en-IN')} this month`,
      subColor: 'text-emerald-600'
    },
    {
      icon: DollarSign,
      value: `₹${netRevenue.toLocaleString('en-IN')}`,
      label: 'Net Earnings',
      sub: '70% of gross revenue',
      subColor: 'text-gray-400'
    },
    {
      icon: Star,
      value: avgRating > 0
             ? avgRating.toFixed(1)
             : '—',
      label: 'Avg Rating',
      sub: `${totalReviews} review${totalReviews !== 1 ? 's' : ''}`,
      subColor: 'text-gray-400'
    }
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gray-50 flex flex-col">
      
      {/* ZONE 1: Page Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-gray-900 font-bold text-xl tracking-tight">
            Good {timeOfDay}, {firstName}! 👋
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {subtitle}
          </p>
        </div>
        
        <Link href="/instructor/courses/new">
          <button className="bg-black text-white rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-gray-800 transition-all active:scale-95">
            <Plus className="w-4 h-4" />
            New Course
          </button>
        </Link>
      </div>

      {/* APPROVAL BANNER */}
      {profile.approval_status === 'pending' && (
        <div className="mx-8 mt-5 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center gap-4">
          <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-amber-800 font-semibold text-sm">
              Account Pending Approval
            </p>
            <p className="text-amber-600 text-xs mt-0.5">
              You can create draft courses while waiting.
              We'll notify you once approved (1-2 business days).
            </p>
          </div>
          <span className="text-amber-500 text-xs font-medium flex-shrink-0">
            In Review
          </span>
        </div>
      )}

      {profile.approval_status === 'rejected' && (
        <div className="mx-8 mt-5 bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-center gap-4">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 font-semibold text-sm">
              Account Rejected
            </p>
            <p className="text-red-600 text-xs mt-0.5">
              {profile.rejection_reason || "Your application wasn't approved. Please contact us at contact@slate.com."}
            </p>
          </div>
          <Link href="mailto:contact@slate.com" className="text-red-500 text-xs font-medium flex-shrink-0 hover:underline">
            Contact Support
          </Link>
        </div>
      )}

      {/* ZONE 2: Stats Row */}
      <div className="grid grid-cols-5 gap-4 px-8 py-5 shrink-0">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center">
                <stat.icon className="w-4.5 h-4.5 text-gray-500" />
              </div>
              
              {i === 1 && pendingReviewCourses > 0 && (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-semibold rounded-full px-2 py-0.5">
                  {pendingReviewCourses} in review
                </span>
              )}
            </div>
            
            <p className="text-gray-900 font-bold text-2xl tracking-tight">
              {stat.value}
            </p>
            
            <p className="text-gray-500 text-xs font-medium mt-0.5">
              {stat.label}
            </p>
            
            <p className={`text-xs mt-1 ${stat.subColor}`}>
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ZONE 3: Main Content Grid */}
      <div className="px-8 pb-8 flex-1 min-h-0">
        <div className="grid grid-cols-3 gap-5 items-start h-full">
          
          {/* LEFT: My Courses (col-span-2) */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-gray-900 font-semibold text-base">
                  My Courses
                </h2>
                {totalCourses > 0 && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-semibold rounded-full px-2.5 py-0.5">
                    {totalCourses}
                  </span>
                )}
              </div>
              
              {totalCourses > 0 && (
                <Link href="/instructor/courses" className="text-gray-500 text-xs hover:text-gray-900 transition-all flex items-center gap-1">
                  View all
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {totalCourses === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                  <BookPlus className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-900 font-semibold text-sm mb-1">
                  No courses yet
                </p>
                <p className="text-gray-400 text-xs mb-5 max-w-xs leading-relaxed">
                  Create your first course to start teaching and earning on Slate.
                </p>
                <Link href="/instructor/courses/new">
                  <button className="bg-black text-white rounded-lg px-4 py-2 text-xs font-semibold flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Create First Course
                  </button>
                </Link>
              </div>
            ) : (
              <div className="overflow-y-auto">
                {courses.slice(0, 4).map((course: any) => (
                  <div key={course.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-all group">
                    <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <CourseThumbnail course={course} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-gray-900 font-medium text-sm truncate">
                          {course.title}
                        </p>
                        <CourseStatusBadge status={course.status} size="sm" />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {course.enrollmentCount} students
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {course.lectureCount} lectures
                        </span>
                        {course.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {course.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <p className="text-emerald-600 font-semibold text-sm">
                        ₹{course.revenue.toLocaleString('en-IN')}
                      </p>
                      <p className="text-gray-400 text-xs">earned</p>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      {course.status === 'draft' && (
                        <Link href={`/instructor/courses/${course.id}/edit`}>
                          <button className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-all">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      )}
                      <Link href={`/instructor/courses/${course.id}/curriculum`}>
                        <button className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-all">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
                
                {totalCourses > 4 && (
                  <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                    <Link href="/instructor/courses" className="text-gray-500 text-xs hover:text-gray-900 transition-all flex items-center justify-center gap-1">
                      View {totalCourses - 4} more courses
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Column */}
          <div className="col-span-1 flex flex-col gap-5">

            {/* Recent Enrollments */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-gray-900 font-semibold text-base">Recent Enrollments</h2>
                {recentEnrollments.length > 0 && (
                  <Link href="/instructor/students" className="text-gray-400 text-xs hover:text-gray-700">
                    View all
                  </Link>
                )}
              </div>
              {recentEnrollments.length === 0 ? (
                <div className="flex flex-col items-center py-8 px-4 text-center">
                  <Users className="w-8 h-8 text-gray-200 mb-2" />
                  <p className="text-gray-400 text-xs">No enrollments yet</p>
                </div>
              ) : (
                <div className="max-h-[320px] overflow-y-auto">
                  {recentEnrollments.map((e: any) => (
                    <div key={e.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {e.student?.full_name?.[0]?.toUpperCase() ?? 'S'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-xs font-medium truncate">{e.student?.full_name ?? 'Student'}</p>
                        <p className="text-gray-400 text-[11px] truncate">{e.course?.title ?? 'Course'}</p>
                      </div>
                      <p className="text-gray-400 text-[11px] flex-shrink-0">{formatRelativeTime(e.enrolled_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-gray-900 font-semibold text-base">Quick Actions</h2>
              </div>
              <div className="p-3">
                {[
                  { icon: PlusCircle, label: 'Create Course',   desc: 'Start a new course',    href: '/instructor/courses/new', iconBg: 'bg-black',     iconColor: 'text-white' },
                  { icon: Users,      label: 'View Students',   desc: 'Manage enrollments',    href: '/instructor/students',    iconBg: 'bg-gray-100',  iconColor: 'text-gray-600' },
                  { icon: DollarSign, label: 'Earnings',        desc: 'Revenue breakdown',     href: '/instructor/earnings',    iconBg: 'bg-gray-100',  iconColor: 'text-gray-600' },
                  { icon: Settings,   label: 'Profile Settings',desc: 'Edit public profile',   href: '/instructor/settings',    iconBg: 'bg-gray-100',  iconColor: 'text-gray-600' },
                ].map((action, i) => (
                  <Link key={i} href={action.href}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${action.iconBg}`}>
                        <action.icon className={`w-4 h-4 ${action.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-gray-900 text-xs font-semibold">{action.label}</p>
                        <p className="text-gray-400 text-[11px]">{action.desc}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Platform Info Card */}
            <div className="bg-gray-900 rounded-2xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-4">Platform Info</p>
              <div className="space-y-3">
                {[
                  { label: 'Your earnings', value: '70% per sale',      valueColor: 'text-emerald-400' },
                  { label: 'Platform fee',  value: '30% per sale',      valueColor: 'text-gray-400' },
                  { label: 'Payouts',       value: 'Monthly',           valueColor: 'text-gray-400' },
                  { label: 'Support',       value: 'support@slate.com', valueColor: 'text-gray-400' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">{item.label}</span>
                    <span className={`text-xs font-semibold ${item.valueColor}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
