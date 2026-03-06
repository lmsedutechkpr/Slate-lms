'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Users,
  TrendingUp,
  CheckCircle2,
  Activity,
  Search,
  Download,
  BookOpen,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Course {
  id: string;
  title: string;
  status: string;
  thumbnail_url: string | null;
  category: { name: string } | null;
}

interface Enrollment {
  id: string;
  enrolled_at: string;
  progress_percent: number;
  completed_at: string | null;
  last_accessed_at: string | null;
  course_id: string;
  student: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  course?: Course;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function InstructorStudentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [progressFilter, setProgressFilter] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get instructor profile id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      // 2. Get all instructor courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title, status, thumbnail_url, category:categories(name)')
        .eq('instructor_id', profile.id)
        .order('created_at', { ascending: false });

      const coursesList = (coursesData ?? []) as any as Course[];
      setCourses(coursesList);

      const courseIds = coursesList.map((c) => c.id);
      if (courseIds.length === 0) {
        setLoading(false);
        return;
      }

      // 3. Get all enrollments with student info
      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select(
          `id, enrolled_at, progress_percent, completed_at,
           last_accessed_at, course_id,
           student:profiles(id, full_name, email, avatar_url)`
        )
        .in('course_id', courseIds)
        .order('enrolled_at', { ascending: false });

      // 4. Enrich with course title
      const enriched: Enrollment[] = (enrollmentsData ?? []).map((e: any) => ({
        ...e,
        course: coursesList.find((c) => c.id === e.course_id),
      }));

      setEnrollments(enriched);
      setLoading(false);
    }

    load();
  }, []);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const totalStudents = useMemo(
    () => new Set(enrollments.map((e) => e.student?.id).filter(Boolean)).size,
    [enrollments]
  );

  const completedCount = useMemo(
    () => enrollments.filter((e) => e.completed_at !== null).length,
    [enrollments]
  );

  const activeCount = useMemo(
    () =>
      enrollments.filter(
        (e) => e.progress_percent > 0 && e.completed_at === null
      ).length,
    [enrollments]
  );

  const avgProgress = useMemo(() => {
    if (!enrollments.length) return 0;
    return Math.round(
      enrollments.reduce((a, e) => a + (e.progress_percent ?? 0), 0) /
        enrollments.length
    );
  }, [enrollments]);

  const newThisMonth = useMemo(() => {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return enrollments.filter((e) => new Date(e.enrolled_at) >= start).length;
  }, [enrollments]);

  const publishedCount = courses.filter((c) => c.status === 'published').length;

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        (e.student?.full_name?.toLowerCase().includes(q) ?? false) ||
        (e.student?.email?.toLowerCase().includes(q) ?? false);

      const matchesCourse = !courseFilter || e.course_id === courseFilter;

      const matchesProgress =
        !progressFilter ||
        (progressFilter === 'not_started'
          ? e.progress_percent === 0
          : progressFilter === 'in_progress'
          ? e.progress_percent > 0 && e.completed_at === null
          : e.completed_at !== null);

      return matchesSearch && matchesCourse && matchesProgress;
    });
  }, [enrollments, search, courseFilter, progressFilter]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* PAGE HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-400 text-sm mt-1">
              {totalStudents} student{totalStudents !== 1 ? 's' : ''} across{' '}
              {publishedCount} published course{publishedCount !== 1 ? 's' : ''}
            </p>
          </div>
          {totalStudents > 0 && (
            <button className="flex items-center gap-2 border border-gray-300 text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      <div className="px-8 py-6">
        {/* STATS ROW */}
        {totalStudents > 0 && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              {
                Icon: Users,
                iconBg: 'bg-blue-50',
                iconColor: 'text-blue-600',
                value: totalStudents,
                label: 'Total Students',
                sub: `+${newThisMonth} this month`,
                subColor: newThisMonth > 0 ? 'text-emerald-600' : 'text-gray-400',
              },
              {
                Icon: TrendingUp,
                iconBg: 'bg-purple-50',
                iconColor: 'text-purple-600',
                value: `${avgProgress}%`,
                label: 'Avg Progress',
                sub: 'Across all courses',
                subColor: 'text-gray-400',
              },
              {
                Icon: CheckCircle2,
                iconBg: 'bg-emerald-50',
                iconColor: 'text-emerald-600',
                value: completedCount,
                label: 'Completed',
                sub: `${enrollments.length} total enrollments`,
                subColor: 'text-gray-400',
              },
              {
                Icon: Activity,
                iconBg: 'bg-amber-50',
                iconColor: 'text-amber-600',
                value: activeCount,
                label: 'In Progress',
                sub: 'Currently learning',
                subColor: 'text-gray-400',
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl p-5"
              >
                <div
                  className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center mb-3`}
                >
                  <stat.Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-500 text-sm mt-0.5">{stat.label}</p>
                <p className={`text-xs mt-1 ${stat.subColor}`}>{stat.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* FILTERS */}
        {totalStudents > 0 && (
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-gray-900 outline-none bg-white"
              />
            </div>

            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 bg-white focus:border-gray-900 outline-none min-w-[180px]"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            <select
              value={progressFilter}
              onChange={(e) => setProgressFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 bg-white focus:border-gray-900 outline-none min-w-[150px]"
            >
              <option value="">All Progress</option>
              <option value="not_started">Not Started (0%)</option>
              <option value="in_progress">In Progress (1-99%)</option>
              <option value="completed">Completed (100%)</option>
            </select>
          </div>
        )}

        {/* EMPTY STATE — no students */}
        {totalStudents === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-semibold text-base mb-1">
              No students yet
            </h3>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-5">
              {publishedCount === 0
                ? 'Publish a course first to start getting students.'
                : 'When students enroll in your courses, they will appear here.'}
            </p>
            {publishedCount === 0 && (
              <Link href="/instructor/courses">
                <button className="bg-black text-white rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Go to My Courses
                </button>
              </Link>
            )}
          </div>
        ) : filteredEnrollments.length === 0 ? (
          /* NO RESULTS */
          <div className="bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-8 h-8 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">
              No students match your search.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setCourseFilter('');
                setProgressFilter('');
              }}
              className="mt-3 text-gray-400 text-sm hover:text-gray-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* STUDENTS TABLE */
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-semibold uppercase tracking-wide">
              <div className="col-span-4">Student</div>
              <div className="col-span-3">Course</div>
              <div className="col-span-2">Progress</div>
              <div className="col-span-2">Enrolled</div>
              <div className="col-span-1">Status</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {filteredEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center"
                >
                  {/* Student */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      {enrollment.student?.avatar_url ? (
                        <img
                          src={enrollment.student.avatar_url}
                          className="w-9 h-9 rounded-full object-cover"
                          alt=""
                        />
                      ) : (
                        <span className="text-gray-600 text-sm font-semibold">
                          {enrollment.student?.full_name?.[0]?.toUpperCase() ??
                            '?'}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-900 text-sm font-medium truncate">
                        {enrollment.student?.full_name ?? 'Unknown'}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {enrollment.student?.email ?? ''}
                      </p>
                    </div>
                  </div>

                  {/* Course */}
                  <div className="col-span-3 min-w-0">
                    <p className="text-gray-700 text-sm truncate font-medium">
                      {enrollment.course?.title ?? 'Unknown'}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {enrollment.course?.category?.name ?? ''}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            enrollment.completed_at !== null
                              ? 'bg-emerald-500'
                              : 'bg-black'
                          }`}
                          style={{
                            width: `${enrollment.completed_at !== null ? 100 : enrollment.progress_percent ?? 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-gray-500 text-xs w-8 text-right flex-shrink-0">
                        {enrollment.completed_at !== null
                          ? 100
                          : enrollment.progress_percent ?? 0}
                        %
                      </span>
                    </div>
                  </div>

                  {/* Enrolled date */}
                  <div className="col-span-2">
                    <p className="text-gray-500 text-sm">
                      {formatRelativeTime(enrollment.enrolled_at)}
                    </p>
                    {enrollment.last_accessed_at && (
                      <p className="text-gray-400 text-xs mt-0.5">
                        Active{' '}
                        {formatRelativeTime(enrollment.last_accessed_at)}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    {enrollment.completed_at !== null ? (
                      <span className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full px-2 py-1 whitespace-nowrap">
                        Completed
                      </span>
                    ) : enrollment.progress_percent > 0 ? (
                      <span className="bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-full px-2 py-1 whitespace-nowrap">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-[11px] font-semibold rounded-full px-2 py-1 whitespace-nowrap">
                        Not started
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <p className="text-gray-400 text-xs">
                Showing {filteredEnrollments.length} of {enrollments.length}{' '}
                enrollments
              </p>
              {filteredEnrollments.length < enrollments.length && (
                <button
                  onClick={() => {
                    setSearch('');
                    setCourseFilter('');
                    setProgressFilter('');
                  }}
                  className="text-gray-400 text-xs hover:text-gray-700 transition-colors"
                >
                  Show all
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
