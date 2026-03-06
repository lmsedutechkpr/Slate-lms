export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-4 w-10 bg-gray-200 rounded" />
          <div className="h-4 w-2 bg-gray-100 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-2 bg-gray-100 rounded" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Image skeleton */}
          <div className="aspect-square bg-gray-200 rounded-2xl" />

          {/* Right panel skeleton */}
          <div>
            {/* Badges */}
            <div className="flex gap-2 mb-3">
              <div className="h-5 w-20 bg-gray-200 rounded-full" />
              <div className="h-5 w-16 bg-gray-100 rounded-full" />
            </div>
            {/* Title */}
            <div className="h-8 w-4/5 bg-gray-200 rounded mb-2" />
            <div className="h-8 w-3/5 bg-gray-200 rounded mb-4" />
            {/* Rating */}
            <div className="flex gap-2 mb-5">
              <div className="h-4 w-24 bg-gray-100 rounded" />
              <div className="h-4 w-16 bg-gray-100 rounded" />
            </div>
            {/* Description */}
            <div className="h-4 w-full bg-gray-100 rounded mb-2" />
            <div className="h-4 w-5/6 bg-gray-100 rounded mb-2" />
            <div className="h-4 w-4/6 bg-gray-100 rounded mb-6" />
            {/* Price */}
            <div className="h-9 w-32 bg-gray-200 rounded mb-6" />
            {/* Button */}
            <div className="h-14 w-full bg-gray-200 rounded-xl" />
          </div>
        </div>

        {/* Specs skeleton */}
        <div className="mb-8">
          <div className="h-6 w-36 bg-gray-200 rounded mb-4" />
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex border-b border-gray-100 last:border-b-0">
                <div className="w-1/3 bg-gray-50 px-4 py-3">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
                <div className="flex-1 px-4 py-3">
                  <div className="h-4 w-32 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related products skeleton */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="aspect-square bg-gray-100" />
                <div className="p-4">
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
                  <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                    <div className="h-5 bg-gray-100 rounded w-16" />
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
