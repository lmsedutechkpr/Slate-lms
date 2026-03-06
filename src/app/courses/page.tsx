import { getCourses, getCategories, getCategoryCourseCounts, getStudentEnrolledCourseIds, getStudentWishlistedCourseIds } from '@/lib/actions/courses';
import { CatalogFilters } from '@/components/courses/CatalogFilters';
import { CatalogSearch } from '@/components/courses/CatalogSearch';
import { CategoryTabs } from '@/components/courses/CategoryTabs';
import { SortControls } from '@/components/courses/SortControls';
import { ActiveFilterTags } from '@/components/courses/ActiveFilterTags';
import { CourseGrid } from '@/components/courses/CourseGrid';
import { createClient } from '@/lib/supabase/server';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  // Parse all filter params
  const search = (params.search as string) || '';
  const category = (params.category as string) || 'all';
  const difficultyParam = (params.difficulty as string) || '';
  const languageParam = (params.language as string) || '';
  const price = (params.price as string) || 'all';
  const sort = (params.sort as string) || 'popular';
  const view = ((params.view as string) || 'grid') as 'grid' | 'list';
  const page = parseInt((params.page as string) || '1', 10);
  const minRating = parseFloat((params.rating as string) || '0') || 0;
  const maxDuration = (params.duration as string) || 'any';

  const difficultyArr = difficultyParam ? difficultyParam.split(',').filter(Boolean) : [];
  const languageArr = languageParam ? languageParam.split(',').filter(Boolean) : [];

  // Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all data in parallel
  const [coursesData, categories, categoryCounts, enrolledIds, wishlistedIds] = await Promise.all([
    getCourses({
      search,
      category,
      difficulty: difficultyArr,
      language: languageArr,
      price,
      sort,
      page,
      minRating,
      maxDuration,
    }),
    getCategories(),
    getCategoryCourseCounts(),
    user ? getStudentEnrolledCourseIds(user.id) : Promise.resolve([]),
    user ? getStudentWishlistedCourseIds(user.id) : Promise.resolve([]),
  ]);

  const { courses, total, totalPages } = coursesData;

  // Build URLSearchParams helper for pagination links
  const baseParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) baseParams[k] = String(v);
  }

  return (
    <div className="-m-4 lg:-m-8 min-h-screen bg-white">
      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-6 lg:px-8 py-6">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Browse Courses</h1>
            <p className="text-sm text-gray-400 mt-0.5">{total.toLocaleString()} courses available</p>
          </div>
          <SortControls sort={sort} view={view} />
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0 border-r border-gray-100 sticky top-0 self-start h-screen overflow-y-auto">
          <CatalogFilters
            categories={categories}
            categoryCounts={categoryCounts}
            activeCategory={category}
            activeFilters={{
              difficulty: difficultyArr,
              language: languageArr,
              price,
              rating: minRating,
              duration: maxDuration,
            }}
          />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Category tabs */}
          <CategoryTabs
            categories={categories}
            activeCategory={category}
            counts={categoryCounts}
          />

          <div className="px-6 lg:px-8 py-5 flex-1">
            {/* Search */}
            <CatalogSearch defaultValue={search} />

            {/* Active filter pills */}
            <ActiveFilterTags
              search={search}
              category={category}
              categories={categories}
              difficulty={difficultyArr}
              price={price}
              rating={minRating}
              duration={maxDuration}
              language={languageArr}
            />

            {/* Result count */}
            <p className="text-xs font-normal uppercase tracking-widest text-gray-400 mb-4">
              {courses.length} of {total} results
            </p>

            {/* Grid / List */}
            {courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-gray-400 text-sm">No courses found.</p>
                <Link
                  href="/courses"
                  className="mt-3 text-sm text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors"
                >
                  Clear filters
                </Link>
              </div>
            ) : (
              <CourseGrid
                courses={courses}
                enrolledIds={enrolledIds}
                wishlistedIds={wishlistedIds}
                view={view}
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-10 pb-4">
                {/* Prev */}
                {page > 1 ? (
                  <Link
                    href={`/courses?${new URLSearchParams({ ...baseParams, page: String(page - 1) })}`}
                    className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <ChevronLeft size={15} />
                  </Link>
                ) : (
                  <span className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed">
                    <ChevronLeft size={15} />
                  </span>
                )}

                {/* Page numbers */}
                {buildPageNumbers(page, totalPages).map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="h-9 w-9 flex items-center justify-center text-gray-400 text-sm">
                      …
                    </span>
                  ) : (
                    <Link
                      key={p}
                      href={`/courses?${new URLSearchParams({ ...baseParams, page: String(p) })}`}
                      className={cn(
                        'h-9 w-9 flex items-center justify-center rounded-lg font-medium text-sm transition-colors',
                        page === p
                          ? 'bg-gray-900 text-white border border-gray-900'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      )}
                    >
                      {p}
                    </Link>
                  )
                )}

                {/* Next */}
                {page < totalPages ? (
                  <Link
                    href={`/courses?${new URLSearchParams({ ...baseParams, page: String(page + 1) })}`}
                    className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <ChevronRight size={15} />
                  </Link>
                ) : (
                  <span className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed">
                    <ChevronRight size={15} />
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}
