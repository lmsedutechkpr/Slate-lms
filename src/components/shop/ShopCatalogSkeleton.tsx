export function ShopCatalogSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Page header skeleton */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 w-40 bg-gray-100 rounded mb-2" />
            <div className="h-7 w-48 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-64 bg-gray-100 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-40 bg-gray-100 rounded-lg" />
            <div className="h-9 w-20 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Filter sidebar skeleton */}
        <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 p-4 hidden lg:block">
          <div className="h-5 w-20 bg-gray-100 rounded mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 w-full bg-gray-50 rounded-lg mb-2" />
          ))}
          <div className="h-px bg-gray-100 my-4" />
          <div className="h-5 w-24 bg-gray-100 rounded mb-3" />
          <div className="flex gap-2 mb-2">
            <div className="h-9 flex-1 bg-gray-100 rounded-lg" />
            <div className="h-9 flex-1 bg-gray-100 rounded-lg" />
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 min-w-0">
          {/* Category tabs */}
          <div className="flex gap-2 px-6 py-3 border-b border-gray-100">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-7 w-24 bg-gray-100 rounded-full" />
            ))}
          </div>

          {/* Search */}
          <div className="px-6 py-3">
            <div className="h-10 w-full bg-gray-100 rounded-xl" />
          </div>

          {/* Featured banner */}
          <div className="mx-6 mb-6 h-32 bg-gray-200 rounded-2xl" />

          {/* Grid */}
          <div className="px-6 grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="aspect-square bg-gray-100" />
                <div className="p-4">
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
                  <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                    <div className="h-5 bg-gray-100 rounded w-20" />
                    <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
