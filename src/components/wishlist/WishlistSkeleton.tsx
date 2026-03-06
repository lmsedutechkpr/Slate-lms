export function WishlistSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 -mx-4 lg:-mx-8 -mt-4 lg:-mt-8 mb-8">
        <div className="h-3 w-32 bg-gray-200 rounded mb-3" />
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-28 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-40 bg-gray-100 rounded" />
          </div>
          <div className="h-9 w-36 bg-gray-100 rounded-lg" />
        </div>
      </div>

      {/* Sort row skeleton */}
      <div className="flex items-center justify-between mb-8 px-8 -mx-4 lg:-mx-8">
        <div className="h-4 w-20 bg-gray-100 rounded" />
        <div className="h-9 w-44 bg-gray-100 rounded-lg" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 px-8 -mx-4 lg:-mx-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            <div className="aspect-video bg-gray-100" />
            <div className="p-4 space-y-3">
              <div className="h-3 w-16 bg-gray-100 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
              <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                <div className="h-9 flex-1 bg-gray-200 rounded-lg" />
                <div className="h-9 flex-1 bg-gray-100 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
