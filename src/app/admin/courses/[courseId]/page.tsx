import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { InstructorBreadcrumb } from '@/components/instructor/InstructorBreadcrumb';
import CourseStatusBadge from '@/components/instructor/CourseStatusBadge';
import { ExternalLink, Users, BookOpen, PlayCircle, Star, CheckCircle2, XCircle, FileText, HelpCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import CourseReviewActions from '@/components/admin/CourseReviewActions';
import { formatRelativeTime } from '@/lib/utils/format';

interface AdminCourseDetailPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function AdminCourseDetailPage({ params }: AdminCourseDetailPageProps) {
  const supabase = await createClient();
  const { courseId } = await params;

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    notFound();
  }

  // Fetch complete course data with exact explicit select statement
  const { data: course, error } = await supabase
    .from('courses')
    .select(
      `id,
      title,
      slug,
      description,
      thumbnail_url,
      price,
      original_price,
      status,
      difficulty,
      language,
      submitted_at,
      published_at,
      created_at,
      rejection_reason,
      what_you_learn,
      requirements,
      tags,
      instructor_id,
      instructor:profiles!instructor_id(
        id, 
        full_name, 
        avatar_url, 
        email, 
        approval_status, 
        bio, 
        headline
      ),
      category:categories(
        id, 
        name, 
        slug
      ),
      sections:course_sections(
        id, title, order_index,
        lectures:lectures(id, title, content_type, duration_minutes, is_free_preview, order_index)
      )`
    )
    .eq('id', courseId)
    .single();

  if (error || !course) {
    console.error('Error fetching course:', error);
    notFound();
  }

  const typedCourse = course as any;

  // Calculate curriculum stats
  const sections = typedCourse.sections?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
  const sectionCount = sections.length;
  // Make sure sections is typed before mapping/reducing
  const lectureCount = sections.reduce((acc: number, section: any) => acc + (section.lectures?.length || 0), 0);

  // Get enrollment and review counts separately
  const [{ count: enrollmentCount }, { count: reviewCount }] = await Promise.all([
    supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId),
    supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)
  ]);

  return (
    <div className="min-h-full bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <InstructorBreadcrumb items={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Courses', href: '/admin/courses' },
          { label: course.title },
        ]} />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 truncate max-w-2xl">
              {course.title}
            </h1>
            <CourseStatusBadge status={course.status} />
          </div>
          {course.status === 'published' && (
            <Link href={`/courses/${course.slug}`} target="_blank">
              <button className="flex items-center gap-2 border border-gray-300 text-gray-700 rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-50">
                <ExternalLink className="w-4 h-4" />
                View Live
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-3 gap-6 items-start">

          {/* LEFT — Course Content (col-span-2) */}
          <div className="col-span-2 space-y-5">

            {/* COURSE THUMBNAIL + META */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
                {typedCourse.thumbnail_url ? (
                  <img src={typedCourse.thumbnail_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${typedCourse.category?.gradient ?? 'from-gray-300 to-gray-500'} flex items-center justify-center`}>
                    <BookOpen className="w-12 h-12 text-white/60" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-gray-900 font-bold text-lg">
                      {course.title}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-gray-400 text-xs bg-gray-100 rounded-lg px-2.5 py-1 capitalize">
                        {typedCourse.difficulty}
                      </span>
                      <span className="text-gray-400 text-xs bg-gray-100 rounded-lg px-2.5 py-1">
                        {typedCourse.language === 'both' ? 'English & Tamil' : typedCourse.language === 'tamil' ? 'Tamil' : 'English'}
                      </span>
                      <span className="text-gray-400 text-xs bg-gray-100 rounded-lg px-2.5 py-1">
                        {typedCourse.category?.name ?? 'Uncategorized'}
                      </span>
                      <span className={`text-xs font-semibold rounded-lg px-2.5 py-1 ${typedCourse.price === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                        {typedCourse.price === 0 ? 'Free' : `₹${typedCourse.price?.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  </div>

                  {/* Instructor info */}
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {typedCourse.instructor?.avatar_url ? (
                        <img src={typedCourse.instructor.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full bg-black flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {typedCourse.instructor?.full_name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-900 text-sm font-semibold">
                        {typedCourse.instructor?.full_name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {typedCourse.instructor?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FULL DESCRIPTION */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-gray-900 font-semibold mb-3">
                Full Description
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {course.description}
              </p>
            </div>

            {/* WHAT YOU'LL LEARN */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 font-semibold">
                  What Students Will Learn
                </h3>
                <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${(course.what_you_learn?.length ?? 0) >= 4 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {course.what_you_learn?.length ?? 0} outcomes
                  {(course.what_you_learn?.length ?? 0) < 4 ? ' (min 4 required)' : ''}
                </span>
              </div>
              {course.what_you_learn?.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {course.what_you_learn.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  No learning outcomes added.
                </p>
              )}
            </div>

            {/* CURRICULUM SUMMARY */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 font-semibold">
                  Curriculum
                </h3>
                <span className="text-gray-500 text-sm">
                  {sectionCount} sections · {lectureCount} lectures
                </span>
              </div>
              <div className="space-y-3">
                {sections?.map((section: any, i: number) => (
                  <div key={section.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-900 text-white text-[10px] font-bold rounded px-1.5 py-0.5">
                          S{i + 1}
                        </span>
                        <span className="text-gray-900 text-sm font-medium">
                          {section.title}
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {section.lectures?.length ?? 0} lectures
                      </span>
                    </div>
                    {section.lectures?.length > 0 && (
                      <div className="divide-y divide-gray-50">
                        {section.lectures.map((lecture: any) => (
                          <div key={lecture.id} className="flex items-center gap-3 px-4 py-2.5">
                            {lecture.content_type === 'video' && (
                              <PlayCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                            )}
                            {lecture.content_type === 'text' && (
                              <FileText className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            )}
                            {lecture.content_type === 'quiz' && (
                              <HelpCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            )}
                            <span className="text-gray-600 text-sm flex-1">
                              {lecture.title}
                            </span>
                            {lecture.duration_minutes > 0 && (
                              <span className="text-gray-400 text-xs">
                                {lecture.duration_minutes}m
                              </span>
                            )}
                            {lecture.is_free_preview && (
                              <span className="bg-blue-50 text-blue-600 text-[10px] font-medium rounded-full px-2 py-0.5">
                                Free
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT — Review Actions (col-span-1, sticky) */}
          <div className="col-span-1 sticky top-6 self-start space-y-4">

            {/* MAIN ACTION CARD */}
            <CourseReviewActions
              courseId={typedCourse.id}
              initialStatus={typedCourse.status}
              rejectionReason={typedCourse.rejection_reason}
              submittedAt={typedCourse.submitted_at}
              publishedAt={typedCourse.published_at}
            />

            {/* COURSE STATS */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-gray-900 font-semibold text-sm mb-4">
                Course Stats
              </h3>
              <div className="space-y-3">
                {[
                  {
                    icon: Users,
                    label: 'Enrollments',
                    value: enrollmentCount ?? 0,
                  },
                  {
                    icon: BookOpen,
                    label: 'Sections',
                    value: sectionCount,
                  },
                  {
                    icon: PlayCircle,
                    label: 'Lectures',
                    value: lectureCount,
                  },
                  {
                    icon: Star,
                    label: 'Reviews',
                    value: reviewCount ?? 0,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500 text-sm">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-gray-900 font-semibold text-sm">
                      {item.value}
                    </span>
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
