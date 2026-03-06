import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Compass, ChevronRight } from 'lucide-react';
import {
  getMyEnrollments,
  getEnrollmentCounts,
  getStudentCertificates,
  MyCoursesFilter,
  MyCoursesSortOption,
} from '@/lib/actions/my-courses';
import { MyCoursesFilter as MyCoursesFilterTabs } from '@/components/my-courses/MyCoursesFilter';
import { MyCoursesSearch } from '@/components/my-courses/MyCoursesSearch';
import { MyCoursesSort } from '@/components/my-courses/MyCoursesSort';
import { MyCoursesList } from '@/components/my-courses/MyCoursesList';

interface PageProps {
  searchParams: Promise<{
    filter?: string;
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function MyCoursesPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/onboarding');

  const params = await searchParams;

  const VALID_FILTERS: MyCoursesFilter[] = ['all', 'in-progress', 'completed'];
  const VALID_SORTS: MyCoursesSortOption[] = ['recent', 'progress', 'enrolled', 'title'];

  const filter: MyCoursesFilter = VALID_FILTERS.includes(params.filter as MyCoursesFilter)
    ? (params.filter as MyCoursesFilter)
    : 'all';
  const search = params.search ?? '';
  const sort: MyCoursesSortOption = VALID_SORTS.includes(params.sort as MyCoursesSortOption)
    ? (params.sort as MyCoursesSortOption)
    : 'recent';
  const page = Math.max(1, parseInt(params.page ?? '1', 10));

  const [{ enrollments, total, totalPages }, counts, certificates] = await Promise.all([
    getMyEnrollments({ studentId: profile.id, filter, search, sort, page, limit: 12 }),
    getEnrollmentCounts(profile.id),
    getStudentCertificates(profile.id),
  ]);

  const lang = profile.preferred_language ?? 'en';

  return (
    <div className="-m-4 lg:-m-8 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-gray-700 transition-colors">
            Dashboard
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-900">My Courses</span>
        </div>

        {/* Title row */}
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-gray-900 font-bold text-2xl tracking-tight">
              {lang === 'ta' ? 'என் படிப்புகள்' : 'My Courses'}
            </h1>
            <p className="mt-1 text-gray-500 text-sm">
              {total > 0
                ? `${total} course${total !== 1 ? 's' : ''} enrolled`
                : 'Start learning today'}
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <Compass size={14} />
            {lang === 'ta' ? 'படிப்புகளை தேடு' : 'Browse Courses'}
          </Link>
        </div>
      </div>

      {/* Filter tabs */}
      <MyCoursesFilterTabs counts={counts} activeFilter={filter} />

      {/* Search + sort bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 lg:px-8 py-3 flex items-center gap-3">
        <MyCoursesSearch defaultValue={search} />
        <MyCoursesSort defaultValue={sort} />
      </div>

      {/* Course list */}
      <div className="px-6 lg:px-8 py-6">
        <MyCoursesList
          initialEnrollments={enrollments}
          certificates={certificates}
          lang={lang}
          totalPages={totalPages}
          currentPage={page}
          filter={filter}
          search={search}
        />
      </div>
    </div>
  );
}
