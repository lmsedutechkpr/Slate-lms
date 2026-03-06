export function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      {/* Profile card skeleton */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="h-20 bg-gray-100" />
        <div className="px-6 pb-6 -mt-8">
          <div className="flex items-end justify-between mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gray-200 border-4 border-white" />
            <div className="h-8 w-28 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-52 bg-gray-100 rounded mb-4" />
          <div className="h-12 w-full bg-gray-50 rounded" />
          <div className="flex gap-5 mt-5 pt-5 border-t border-gray-100">
            <div className="h-8 w-24 bg-gray-100 rounded" />
            <div className="h-8 w-24 bg-gray-100 rounded" />
            <div className="h-8 w-24 bg-gray-100 rounded" />
          </div>
        </div>
      </div>

      {/* Avatar upload skeleton */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="h-4 w-28 bg-gray-200 rounded mb-5" />
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-44 bg-gray-100 rounded" />
            <div className="h-9 w-32 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Edit form skeleton */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="h-4 w-36 bg-gray-200 rounded" />
        </div>
        <div className="px-6 py-5 space-y-5">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 bg-gray-100 rounded" />
              <div className="h-10 w-full bg-gray-100 rounded-xl" />
            </div>
          ))}
          <div className="h-16 w-full bg-gray-100 rounded-xl" />
          <div className="flex gap-2">
            <div className="h-10 flex-1 bg-gray-100 rounded-xl" />
            <div className="h-10 flex-1 bg-gray-100 rounded-xl" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 w-24 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
