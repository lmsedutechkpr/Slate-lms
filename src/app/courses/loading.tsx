export default function CoursesLoading() {
  return (
    <div className="-m-4 lg:-m-8 min-h-screen bg-white">
      {/* Page Header Skeleton */}
      <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-6">
        <div className="h-3 w-32 bg-gray-100 rounded mb-3 animate-pulse" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="h-7 w-48 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-9 w-40 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Skeleton */}
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-200 p-5 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-3 w-full bg-gray-50 rounded animate-pulse" />
              ))}
            </div>
          ))}
        </aside>

        {/* Content Skeleton */}
        <div className="flex-1 min-w-0">
          {/* Category Tabs Skeleton */}
          <div className="border-b border-gray-200 px-6 lg:px-8 py-3.5 flex gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>

          <div className="px-6 lg:px-8 py-5">
            {/* Search Skeleton */}
            <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse mb-5" />

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200 overflow-hidden animate-pulse"
                >
                  <div className="aspect-video bg-gray-100" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-4 w-full bg-gray-100 rounded" />
                    <div className="h-3 w-3/4 bg-gray-100 rounded" />
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                    <div className="flex gap-2 pt-1">
                      <div className="h-3 w-16 bg-gray-100 rounded" />
                      <div className="h-3 w-16 bg-gray-100 rounded" />
                    </div>
                    <div className="border-t border-gray-100 pt-3 mt-1">
                      <div className="h-4 w-16 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
