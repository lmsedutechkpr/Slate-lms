import { getCourseBySlug } from '@/lib/actions/courses';
import { createClient } from '@/lib/supabase/server';
import { CourseDetailHero } from '@/components/courses/CourseDetailHero';
import { CourseCurriculum } from '@/components/courses/CourseCurriculum';
import { CourseInstructor } from '@/components/courses/CourseInstructor';
import { CourseReviewsSection } from '@/components/courses/CourseReviewsSection';
import { EnrollSidebar } from '@/components/courses/EnrollSidebar';
import { CheckCircle2, Eye, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { course, sections, isEnrolled, isWishlisted, reviewStats, reviews } =
    await getCourseBySlug(slug, user?.id);

  // If not found via published-only query, check if instructor is previewing their own draft
  let finalCourse = course;
  let finalSections = sections;
  let isDraftPreview = false;

  if (!finalCourse && user?.id) {
    const { data: draftCourse } = await supabase
      .from('courses')
      .select('*, category:categories(*), instructor:profiles(id, full_name, avatar_url, bio)')
      .eq('slug', slug)
      .eq('instructor_id', user.id)
      .single();

    if (draftCourse) {
      finalCourse = draftCourse as any;
      isDraftPreview = true;

      // Fetch sections for the draft course
      const { data: draftSections } = await supabase
        .from('course_sections')
        .select('*, lectures(id, title, title_ta, duration_minutes, order_index, is_free_preview, section_id)')
        .eq('course_id', draftCourse.id)
        .order('order_index');
      finalSections = (draftSections as any) ?? [];
    }
  }

  if (!finalCourse) notFound();

  let isInCart = false;
  if (user?.id) {
    const { data } = await supabase
      .from('cart_items')
      .select('id')
      .eq('student_id', user.id)
      .eq('item_type', 'course')
      .eq('course_id', finalCourse.id)
      .maybeSingle();
    isInCart = !!data;
  }

  const defaultItems = [
    'Master the core fundamentals of the subject',
    'Hands-on practical projects and exercises',
    'Expert tips and real-world applications',
    'Community support and lifetime access',
  ];

  const whatYouLearn =
    finalCourse.what_you_learn && finalCourse.what_you_learn.length > 0
      ? finalCourse.what_you_learn
      : defaultItems;

  const requirements =
    finalCourse.requirements && finalCourse.requirements.length > 0
      ? finalCourse.requirements
      : ['No prior knowledge required', 'A device with internet access', 'Eagerness to learn'];

  return (
    <div className="-m-4 lg:-m-8">
      {/* Draft preview banner */}
      {isDraftPreview && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-3">
          <Eye className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-amber-700 text-sm">
            <strong>Draft Preview</strong> — This is how your course will look when published.
            Students cannot see it yet.
          </p>
          <Link
            href={`/instructor/courses/${finalCourse.id}/edit`}
            className="ml-auto text-amber-700 text-sm font-semibold hover:text-amber-900 flex items-center gap-1 flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Edit
          </Link>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left — main content */}
          <div className="lg:col-span-8 space-y-10">
            {/* Hero */}
            <CourseDetailHero course={finalCourse} reviewTotal={reviewStats.total} />

            {/* What you'll learn */}
            {whatYouLearn.length > 0 && (
              <section className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-5">What you&apos;ll learn</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {whatYouLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2
                        size={15}
                        className="text-emerald-500 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Curriculum */}
            <section>
              <CourseCurriculum sections={finalSections} isEnrolled={isEnrolled} />
            </section>

            {/* Requirements */}
            {requirements.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2.5">
                  {requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2" />
                      <span className="text-sm text-gray-700 leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Description */}
            {finalCourse.description && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">About this course</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{finalCourse.description}</p>
              </section>
            )}

            {/* Instructor */}
            {finalCourse.instructor && <CourseInstructor instructor={Array.isArray(finalCourse.instructor) ? finalCourse.instructor[0] : finalCourse.instructor} />}

            {/* Reviews */}
            {reviewStats.total > 0 && (
              <section>
                <CourseReviewsSection reviews={reviews} reviewStats={reviewStats} />
              </section>
            )}
          </div>

          {/* Right — sticky sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-6">
            <EnrollSidebar
              course={finalCourse}
              isEnrolled={isEnrolled}
              isInCart={isInCart}
              isWishlisted={isWishlisted}
              isLoggedIn={!!user}
              studentId={user?.id ?? null}
            />
          </div>

        </div>
      </main>
    </div>
  );
}
