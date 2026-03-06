import Link from 'next/link';
import { getAdminDashboardStats } from '@/lib/actions/admin';
import { formatRelativeTime } from '@/lib/utils/format';
import {
  Users,
  GraduationCap,
  BookOpen,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Tag,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import RevenueChart from '@/components/admin/RevenueChart';
import RoleBreakdownChart from '@/components/admin/RoleBreakdownChart';

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const {
    studentCount,
    instructorCount,
    publishedCount,
    pendingCount,
    enrollmentCount,
    pendingInstructorCount,
    newThisWeek: newStudentsThisWeek,
    grossRevenue,
    platformRevenue,
    pendingCourseReviews: pendingCourses,
    pendingInstructorsList: pendingInstructors,
    recentEnrollments,
    revenueChartData,
    roleBreakdown,
  } = stats;

  const draftCount = 0; // We don't get draftcount from stats currently, but can mock or just show 0
  const instructorRevenue = grossRevenue * 0.70;

  return (
    <div className="min-h-full bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          {/* Last updated */}
          <p className="text-gray-400 text-xs">
            Live data
          </p>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">

        {/* URGENT BANNER — only if actions needed */}
        {(pendingCount > 0 || pendingInstructorCount > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-amber-900 font-semibold text-sm">
                  Action Required
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  {pendingCount > 0 && (
                    <Link href="/admin/courses?status=pending_review">
                      <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-3 py-2 hover:border-amber-400 transition-colors cursor-pointer">
                        <BookOpen className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-700 text-sm font-medium">
                          {pendingCount} course{pendingCount > 1 ? 's' : ''} awaiting review
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                    </Link>
                  )}
                  {pendingInstructorCount > 0 && (
                    <Link href="/admin/instructors?status=pending">
                      <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-3 py-2 hover:border-amber-400 transition-colors cursor-pointer">
                        <GraduationCap className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-700 text-sm font-medium">
                          {pendingInstructorCount} instructor{pendingInstructorCount > 1 ? 's' : ''} pending approval
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATS GRID — 4 cards */}
        <div className="grid grid-cols-4 gap-4">

          {/* Students */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              {newStudentsThisWeek > 0 && (
                <span className="bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-full px-2 py-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +{newStudentsThisWeek}
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {studentCount ?? 0}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Total Students
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              {newStudentsThisWeek > 0
                ? `+${newStudentsThisWeek} joined this week`
                : 'No new students this week'
              }
            </p>
          </div>

          {/* Instructors */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-purple-600" />
              </div>
              {pendingInstructorCount > 0 && (
                <span className="bg-amber-50 text-amber-600 text-[11px] font-bold rounded-full px-2 py-0.5">
                  {pendingInstructorCount} pending
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {instructorCount ?? 0}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Instructors
            </p>
            <p className={`text-xs mt-0.5 ${pendingInstructorCount > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
              {pendingInstructorCount > 0
                ? `${pendingInstructorCount} awaiting approval`
                : 'All approved'
              }
            </p>
          </div>

          {/* Published Courses */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              {pendingCount > 0 && (
                <span className="bg-amber-50 text-amber-600 text-[11px] font-bold rounded-full px-2 py-0.5">
                  {pendingCount} in review
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {publishedCount ?? 0}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Published Courses
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              {draftCount ?? 0} drafts · {pendingCount ?? 0} pending
            </p>
          </div>

          {/* Platform Revenue */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-amber-600" />
              </div>
              <span className="bg-gray-100 text-gray-600 text-[11px] font-bold rounded-full px-2 py-0.5">
                30% share
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ₹{platformRevenue.toLocaleString('en-IN', {
                maximumFractionDigits: 0
              })}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Platform Revenue
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              ₹{grossRevenue.toLocaleString('en-IN', {
                maximumFractionDigits: 0
              })} gross · {enrollmentCount ?? 0} enrollments
            </p>
          </div>
        </div>

        {/* REVENUE CHART SECTION */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="mb-4">
            <h2 className="text-gray-900 font-semibold">Revenue Over Time (Last 7 Days)</h2>
            <p className="text-gray-500 text-sm">Gross revenue from all course and product sales</p>
          </div>
          <RevenueChart data={revenueChartData} />
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-3 gap-6">

          {/* PENDING REVIEWS (col-span-2) */}
          <div className="col-span-2 space-y-5">

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <h2 className="text-gray-900 font-semibold">
                    Pending Course Reviews
                  </h2>
                  {pendingCount > 0 && (
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold rounded-full px-2.5 py-0.5">
                      {pendingCount}
                    </span>
                  )}
                </div>
                <Link href="/admin/courses?status=pending_review">
                  <span className="text-sm text-gray-400 hover:text-gray-700 transition-150">
                    View all →
                  </span>
                </Link>
              </div>

              {!pendingCourses?.length ? (
                <div className="py-16 text-center">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                  </div>
                  <p className="text-gray-900 font-semibold text-sm">
                    All caught up!
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    No courses waiting for review.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {pendingCourses.map(course => (
                    <div key={course.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">

                      {/* Thumbnail */}
                      <div className="w-20 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${course.category?.gradient ?? 'from-gray-300 to-gray-500'} flex items-center justify-center`}>
                            <BookOpen className="w-5 h-5 text-white/80" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-semibold truncate">
                          {course.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                              {course.instructor?.avatar_url ? (
                                <img src={course.instructor.avatar_url} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                                  <span className="text-white text-[8px] font-bold">
                                    {course.instructor?.full_name?.[0]?.toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <span className="text-gray-500 text-xs">
                              {course.instructor?.full_name ?? 'Unknown'}
                            </span>
                          </div>
                          <span className="text-gray-300">·</span>
                          <span className="text-gray-400 text-xs">
                            {course.category?.name ?? 'Uncategorized'}
                          </span>
                          <span className="text-gray-300">·</span>
                          <span className="text-gray-400 text-xs">
                            {course.price === 0
                              ? 'Free'
                              : `₹${course.price?.toLocaleString('en-IN')}`
                            }
                          </span>
                        </div>
                      </div>

                      {/* Wait time */}
                      <div className="flex-shrink-0 text-right">
                        <p className="text-amber-600 text-xs font-medium">
                          {formatRelativeTime(course.submitted_at)}
                        </p>
                        <p className="text-gray-400 text-[11px] mt-0.5">
                          waiting
                        </p>
                      </div>

                      {/* CTA */}
                      <Link href={`/admin/courses/${course.id}`}>
                        <button className="bg-black text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-gray-800 transition-150 flex-shrink-0 whitespace-nowrap">
                          Review Now
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RECENT ENROLLMENTS */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-gray-900 font-semibold">
                  Recent Enrollments
                </h2>
                <span className="bg-gray-100 text-gray-600 text-xs font-medium rounded-full px-2.5 py-1">
                  {enrollmentCount ?? 0} total
                </span>
              </div>

              {!recentEnrollments?.length ? (
                <div className="py-12 text-center">
                  <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    No enrollments yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentEnrollments.map((e, i) => (
                    <div key={i} className="flex items-center gap-3 px-6 py-3.5">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {e.student?.avatar_url ? (
                          <img src={e.student.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-gray-600 text-xs font-bold">
                            {e.student?.full_name?.[0]?.toUpperCase() ?? '?'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">
                          <span className="font-semibold text-gray-900">
                            {e.student?.full_name ?? 'Unknown'}
                          </span>
                          <span className="text-gray-400"> enrolled in </span>
                          <span className="font-medium text-gray-800">
                            {e.course?.title ?? 'Unknown Course'}
                          </span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Paid: <span className="font-semibold text-emerald-600">₹{e.amount_paid?.toLocaleString('en-IN') ?? 0}</span>
                        </p>
                      </div>
                      <span className="text-gray-400 text-xs flex-shrink-0">
                        {formatRelativeTime(e.enrolled_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">

            {/* PENDING INSTRUCTORS */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h2 className="text-gray-900 font-semibold text-sm">
                    Pending Instructors
                  </h2>
                  {pendingInstructorCount > 0 && (
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold rounded-full px-2 py-0.5">
                      {pendingInstructorCount}
                    </span>
                  )}
                </div>
                <Link href="/admin/instructors?status=pending">
                  <span className="text-gray-400 text-xs hover:text-gray-700">
                    View all →
                  </span>
                </Link>
              </div>

              {!pendingInstructors?.length ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs">
                    No pending approvals
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {pendingInstructors.map((inst: any) => (
                    <div key={inst.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {inst.avatar_url ? (
                          <img src={inst.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-gray-600 text-sm font-bold">
                            {inst.full_name?.[0]?.toUpperCase() ?? '?'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-semibold truncate">
                          {inst.full_name}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          {formatRelativeTime(inst.created_at)}
                        </p>
                      </div>
                      <Link href={`/admin/instructors/${inst.id}`}>
                        <button className="bg-black text-white rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-gray-800 flex-shrink-0">
                          Review
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PLATFORM STATS */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="text-gray-900 font-semibold text-sm mb-4">
                Platform Overview
              </h2>
              <div className="space-y-3">
                {[
                  {
                    label: 'Total enrollments',
                    value: `${enrollmentCount ?? 0}`,
                    color: 'text-gray-900',
                  },
                  {
                    label: 'Gross revenue',
                    value: `₹${grossRevenue.toLocaleString('en-IN', {
                      maximumFractionDigits: 0
                    })}`,
                    color: 'text-gray-900',
                  },
                  {
                    label: 'Instructor earnings (70%)',
                    value: `₹${instructorRevenue.toLocaleString('en-IN', {
                      maximumFractionDigits: 0
                    })}`,
                    color: 'text-emerald-600',
                  },
                  {
                    label: 'Platform revenue (30%)',
                    value: `₹${platformRevenue.toLocaleString('en-IN', {
                      maximumFractionDigits: 0
                    })}`,
                    color: 'text-blue-600',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-500 text-sm">
                      {item.label}
                    </span>
                    <span className={`font-bold text-sm ${item.color}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Revenue split bar */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-black h-full rounded-full" style={{ width: '70%' }} />
                  </div>
                  <span className="text-gray-500 text-xs">70/30</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">
                    Instructors 70%
                  </span>
                  <span className="text-gray-500">
                    Platform 30%
                  </span>
                </div>
              </div>
            </div>

            {/* ROLE BREAKDOWN */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="text-gray-900 font-semibold text-sm mb-4">
                User Roles
              </h2>
              <RoleBreakdownChart data={roleBreakdown} />
              <div className="flex items-center justify-center gap-4 mt-2">
                {roleBreakdown.map((role: any) => (
                  <div key={role.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: role.fill }} />
                    <span className="text-xs text-gray-500">{role.name}</span>
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
