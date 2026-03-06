import { createClient } from '@/lib/supabase/server';
import { getInstructorCourseDetails } from '@/lib/actions/instructor';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Pencil,
  BookOpen,
  Clock,
  ExternalLink,
  Users,
  TrendingUp,
  Star,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Globe,
  Tag,
  BarChart2,
  IndianRupee,
  Calendar,
  ArrowRight,
  Check,
  ChevronRight,
} from 'lucide-react';
import CourseStatusBadge from '@/components/instructor/CourseStatusBadge';
import SubmitForReviewButton from '@/components/instructor/SubmitForReviewButton';
import { InstructorBreadcrumb } from '@/components/instructor/InstructorBreadcrumb';
import { format, formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CourseOverviewPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(date: string) {
  try { return format(new Date(date), 'MMM d, yyyy'); } catch { return '—'; }
}

function formatRelativeTime(date: string) {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); } catch { return '—'; }
}

export default async function CourseOverviewPage({ params }: CourseOverviewPageProps) {
  const { id: courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect('/login');

  const details = await getInstructorCourseDetails(courseId, user.id);
  if (!details) return notFound();

  const { course, sectionCount, lectureCount, enrollmentCount, totalRevenue, recentEnrollments, checklist } = details;

  // Fetch reviews for rating
  const { data: reviews } = await supabase
    .from('course_reviews')
    .select('rating')
    .eq('course_id', courseId);

  const reviewCount = reviews?.length ?? 0;
  const avgRating = reviewCount > 0
    ? reviews!.reduce((a, r) => a + r.rating, 0) / reviewCount
    : 0;

  const instructorRevenue = Math.round(totalRevenue * 0.7);

  const completedCount = checklist.completedCount;
  const allDone = completedCount === 8;

  const checklistItems = [
    {
      id: 'title',
      label: 'Course Title',
      hint: `${(course.title || '').length}/100 chars (min 10)`,
      done: checklist.items.title,
      href: `/instructor/courses/${courseId}/edit`,
    },
    {
      id: 'description',
      label: 'Description',
      hint: `${(course.description || '').length} chars (min 50)`,
      done: checklist.items.description,
      href: `/instructor/courses/${courseId}/edit`,
    },
    {
      id: 'category',
      label: 'Category',
      hint: 'Select a course category',
      done: checklist.items.category,
      href: `/instructor/courses/${courseId}/edit`,
    },
    {
      id: 'thumbnail',
      label: 'Course Thumbnail',
      hint: 'Upload a cover image',
      done: checklist.items.thumbnail,
      href: `/instructor/courses/${courseId}/edit`,
    },
    {
      id: 'what_you_learn',
      label: 'Learning Outcomes',
      hint: `${(course.what_you_learn || []).length} added (min 4)`,
      done: checklist.items.what_you_learn,
      href: `/instructor/courses/${courseId}/edit`,
    },
    {
      id: 'sections',
      label: 'Curriculum Sections',
      hint: `${sectionCount} section${sectionCount !== 1 ? 's' : ''} (min 1)`,
      done: checklist.items.sections,
      href: `/instructor/courses/${courseId}/curriculum`,
    },
    {
      id: 'lectures',
      label: 'Curriculum Lectures',
      hint: `${lectureCount} lecture${lectureCount !== 1 ? 's' : ''} (min 3)`,
      done: checklist.items.lectures,
      href: `/instructor/courses/${courseId}/curriculum`,
    },
    {
      id: 'price',
      label: 'Pricing',
      hint: 'Set free or paid price',
      done: checklist.items.price,
      href: `/instructor/courses/${courseId}/edit`,
    },
  ];

  return (
    <div className="min-h-full bg-gray-50">

      {/* ── PAGE HEADER ── */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <InstructorBreadcrumb items={[
          { label: 'My Courses', href: '/instructor/courses' },
          { label: course.title },
        ]} />

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate max-w-xl">
              {course.title}
            </h1>
            <CourseStatusBadge status={course.status} />
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href={`/instructor/courses/${courseId}/edit`}>
              <button className="flex items-center gap-2 border border-gray-300 text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
                <Pencil className="w-4 h-4" />
                Edit Course
              </button>
            </Link>
            <Link href={`/instructor/courses/${courseId}/curriculum`}>
              <button className="flex items-center gap-2 bg-black text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors">
                <BookOpen className="w-4 h-4" />
                Curriculum
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-3 gap-6 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="col-span-2 space-y-5">

            {/* STAT CARDS */}
            <div className="grid grid-cols-4 gap-4">
              {[
                {
                  icon: Users,
                  iconBg: 'bg-blue-50',
                  iconColor: 'text-blue-600',
                  value: enrollmentCount.toLocaleString(),
                  label: 'Students',
                  sub: enrollmentCount === 0 ? 'No students yet' : `${enrollmentCount} enrolled`,
                },
                {
                  icon: TrendingUp,
                  iconBg: 'bg-emerald-50',
                  iconColor: 'text-emerald-600',
                  value: `₹${instructorRevenue.toLocaleString('en-IN')}`,
                  label: 'Revenue',
                  sub: 'Your 70% share',
                },
                {
                  icon: BookOpen,
                  iconBg: 'bg-purple-50',
                  iconColor: 'text-purple-600',
                  value: lectureCount,
                  label: 'Lectures',
                  sub: `${sectionCount} section${sectionCount !== 1 ? 's' : ''}`,
                },
                {
                  icon: Star,
                  iconBg: 'bg-amber-50',
                  iconColor: 'text-amber-600',
                  value: avgRating > 0 ? avgRating.toFixed(1) : '—',
                  label: 'Rating',
                  sub: reviewCount > 0 ? `${reviewCount} review${reviewCount !== 1 ? 's' : ''}` : 'No reviews yet',
                },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{stat.label}</p>
                  <p className="text-gray-400 text-xs mt-1">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* PUBLISH CHECKLIST */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-gray-900 font-semibold text-base">Publish Checklist</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Complete all items to submit for review</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${allDone ? 'bg-emerald-500' : 'bg-black'}`}
                      style={{ width: `${(completedCount / 8) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    allDone ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {completedCount}/8
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
                {checklistItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      item.done
                        ? 'bg-emerald-50 border-2 border-emerald-200'
                        : 'bg-gray-50 border-2 border-gray-200'
                    }`}>
                      {item.done ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${item.done ? 'text-gray-900' : 'text-gray-600'}`}>
                        {item.label}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">{item.hint}</p>
                    </div>
                    {!item.done && item.href && (
                      <Link href={item.href}>
                        <span className="flex items-center gap-1 text-gray-400 text-xs hover:text-black transition-colors flex-shrink-0 mt-1 font-medium">
                          Fix
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* RECENT ENROLLMENTS */}
            {recentEnrollments.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="text-gray-900 font-semibold text-base">Recent Enrollments</h2>
                  <Link href={`/instructor/students?course=${courseId}`}>
                    <span className="text-gray-400 text-sm hover:text-gray-700 transition-colors">View all →</span>
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {recentEnrollments.map((enrollment: any) => (
                    <div key={enrollment.id} className="flex items-center gap-4 px-6 py-3">
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarImage src={enrollment.student?.avatar_url} />
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-semibold">
                          {enrollment.student?.full_name?.[0]?.toUpperCase() ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-medium truncate">
                          {enrollment.student?.full_name ?? 'Unknown'}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Enrolled {formatRelativeTime(enrollment.enrolled_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-black h-1.5 rounded-full"
                            style={{ width: `${enrollment.progress_percent ?? 0}%` }}
                          />
                        </div>
                        <span className="text-gray-500 text-xs w-8 text-right">
                          {enrollment.progress_percent ?? 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COURSE DETAILS */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-gray-900 font-semibold text-base mb-4">Course Details</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {[
                  {
                    label: 'Category',
                    value: course.category?.name ?? 'Not set',
                    icon: Tag,
                  },
                  {
                    label: 'Difficulty',
                    value: course.difficulty
                      ? course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)
                      : 'Not set',
                    icon: BarChart2,
                  },
                  {
                    label: 'Language',
                    value: course.language === 'english'
                      ? 'English'
                      : course.language === 'tamil'
                        ? 'Tamil'
                        : course.language === 'both'
                          ? 'English & Tamil'
                          : 'Not set',
                    icon: Globe,
                  },
                  {
                    label: 'Price',
                    value: course.price === 0
                      ? 'Free'
                      : `₹${(course.price ?? 0).toLocaleString('en-IN')}`,
                    icon: IndianRupee,
                  },
                  {
                    label: 'Created',
                    value: formatDate(course.created_at),
                    icon: Calendar,
                  },
                  {
                    label: 'Last Updated',
                    value: formatRelativeTime(course.updated_at),
                    icon: Clock,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">{item.label}</p>
                      <p className="text-gray-900 text-sm font-medium mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link href={`/instructor/courses/${courseId}/edit`}>
                  <button className="flex items-center gap-2 text-gray-500 text-sm hover:text-gray-900 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                    Edit course details
                  </button>
                </Link>
              </div>
            </div>

          </div>
          {/* END LEFT COLUMN */}

          {/* ── RIGHT COLUMN (sticky) ── */}
          <div className="col-span-1 space-y-4 sticky top-6 self-start">

            {/* SUBMIT FOR REVIEW CARD */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-gray-900 font-semibold text-sm">Submit for Review</h3>
              </div>
              <div className="px-5 py-4">

                {course.status === 'draft' && (
                  <>
                    {allDone ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-emerald-700 text-xs font-semibold">Ready to submit!</p>
                          <p className="text-emerald-600 text-[11px] mt-0.5">All 8 requirements met.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-amber-700 text-xs font-semibold">
                            {8 - completedCount} item{8 - completedCount !== 1 ? 's' : ''} remaining
                          </p>
                          <p className="text-amber-600 text-[11px] mt-0.5">Complete checklist to submit.</p>
                        </div>
                      </div>
                    )}
                    <SubmitForReviewButton
                      courseId={courseId}
                      instructorId={user.id}
                      isReady={allDone}
                    />
                  </>
                )}

                {course.status === 'pending_review' && (
                  <div className="text-center py-2">
                    <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-amber-500" />
                    </div>
                    <p className="text-gray-900 font-semibold text-sm">Under Review</p>
                    {course.submitted_at && (
                      <p className="text-gray-400 text-xs mt-1">
                        Submitted {formatRelativeTime(course.submitted_at)}
                      </p>
                    )}
                    <p className="text-gray-400 text-xs mt-1">Typical review: 1–3 business days</p>
                  </div>
                )}

                {course.status === 'published' && (
                  <div className="text-center py-2">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Globe className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="text-gray-900 font-semibold text-sm">Live on Slate</p>
                    {course.published_at && (
                      <p className="text-gray-400 text-xs mt-1">
                        Published {formatRelativeTime(course.published_at)}
                      </p>
                    )}
                    <Link href={`/courses/${course.slug}`} target="_blank" className="mt-3 block">
                      <button className="w-full border border-gray-300 text-gray-700 rounded-xl py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Live Course
                      </button>
                    </Link>
                  </div>
                )}

                {course.status === 'rejected' && (
                  <div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <p className="text-red-700 text-xs font-semibold">Course Rejected</p>
                      </div>
                      {course.rejection_reason && (
                        <p className="text-red-600 text-xs leading-relaxed">
                          &ldquo;{course.rejection_reason}&rdquo;
                        </p>
                      )}
                    </div>
                    <Link href={`/instructor/courses/${courseId}/edit`}>
                      <button className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                        <Pencil className="w-4 h-4" />
                        Fix & Resubmit
                      </button>
                    </Link>
                  </div>
                )}

              </div>
            </div>

            {/* PLATFORM TERMS CARD */}
            <div className="bg-gray-900 rounded-2xl p-5">
              <p className="text-gray-400 text-[11px] uppercase tracking-widest font-semibold mb-4">
                Platform Terms
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Your earnings</span>
                  <span className="text-emerald-400 text-sm font-bold">70% per sale</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Platform fee</span>
                  <span className="text-gray-400 text-sm font-medium">30% per sale</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '70%' }} />
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-800">
                  <span className="text-gray-400 text-xs">Payout</span>
                  <span className="text-gray-300 text-xs font-medium">Monthly</span>
                </div>
              </div>
            </div>

            {/* QUICK LINKS CARD */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Course Pages</p>
              </div>
              {[
                {
                  icon: Pencil,
                  label: 'Edit Course Info',
                  desc: 'Update title, description, pricing',
                  href: `/instructor/courses/${courseId}/edit`,
                },
                {
                  icon: BookOpen,
                  label: 'Manage Curriculum',
                  desc: `${sectionCount} section${sectionCount !== 1 ? 's' : ''}, ${lectureCount} lecture${lectureCount !== 1 ? 's' : ''}`,
                  href: `/instructor/courses/${courseId}/curriculum`,
                },
                {
                  icon: Users,
                  label: 'View Students',
                  desc: `${enrollmentCount} enrolled`,
                  href: `/instructor/students?course=${courseId}`,
                },
              ].map((link, i) => (
                <Link key={i} href={link.href}>
                  <div className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                      <link.icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm font-medium">{link.label}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{link.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>

          </div>
          {/* END RIGHT COLUMN */}

        </div>
      </div>
    </div>
  );
}
