export function MyCourseSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="h-3 w-40 bg-gray-200 rounded mb-3" />
        <div className="h-7 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-32 bg-gray-100 rounded" />
      </div>

      {/* Filter tabs */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-5 w-24 bg-gray-100 rounded-full" />
        ))}
      </div>

      {/* Search + sort */}
      <div className="px-8 flex gap-3">
        <div className="flex-1 h-10 bg-gray-100 rounded-lg" />
        <div className="w-40 h-10 bg-gray-100 rounded-lg" />
      </div>

      {/* Cards */}
      <div className="px-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex">
            <div className="w-48 h-32 bg-gray-200 flex-shrink-0" />
            <div className="flex-1 p-5 space-y-3">
              <div className="flex gap-2">
                <div className="h-4 w-20 bg-gray-100 rounded-full" />
                <div className="h-4 w-16 bg-gray-100 rounded-full" />
              </div>
              <div className="h-5 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
              <div className="h-2 w-full bg-gray-100 rounded-full mt-2" />
              <div className="flex gap-2 pt-2">
                <div className="h-8 w-28 bg-gray-200 rounded-lg" />
                <div className="h-8 w-20 bg-gray-100 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
