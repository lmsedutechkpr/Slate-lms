export function ProgressSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2"
          >
            <div className="w-9 h-9 rounded-xl bg-gray-100" />
            <div className="space-y-1.5 text-center">
              <div className="h-5 w-10 bg-gray-200 rounded mx-auto" />
              <div className="h-3 w-14 bg-gray-100 rounded mx-auto" />
            </div>
          </div>
        ))}
      </div>

      {/* Weekly chart skeleton */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 h-52" />

      {/* Tabs skeleton */}
      <div>
        <div className="flex gap-2 mb-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-9 w-28 bg-gray-100 rounded-lg" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4"
            >
              <div className="w-20 h-14 rounded-xl bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
                <div className="h-2 w-full bg-gray-100 rounded-full" />
                <div className="h-3 w-1/3 bg-gray-100 rounded" />
              </div>
              <div className="w-20 h-8 bg-gray-100 rounded-lg flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
