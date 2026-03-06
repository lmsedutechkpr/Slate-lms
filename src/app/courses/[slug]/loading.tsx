export default function CourseDetailLoading() {
  return (
    <div className="-m-4 lg:-m-8">
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left */}
          <div className="lg:col-span-8 space-y-10 animate-pulse">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-5">
              <div className="h-3 w-16 bg-gray-100 rounded" />
              <div className="h-3 w-3 bg-gray-100 rounded" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>

            {/* Title */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
                <div className="h-6 w-24 bg-gray-100 rounded-full" />
              </div>
              <div className="h-9 w-3/4 bg-gray-100 rounded" />
              <div className="h-9 w-1/2 bg-gray-100 rounded" />
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-5/6 bg-gray-100 rounded" />
              <div className="flex gap-4 pt-1">
                <div className="h-4 w-24 bg-gray-100 rounded" />
                <div className="h-4 w-24 bg-gray-100 rounded" />
                <div className="h-4 w-24 bg-gray-100 rounded" />
              </div>
            </div>

            {/* What you'll learn */}
            <div className="border border-gray-200 rounded-xl p-6 space-y-3">
              <div className="h-6 w-40 bg-gray-100 rounded" />
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-100 rounded" />
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 animate-pulse">
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="aspect-video bg-gray-100" />
              <div className="p-5 space-y-4">
                <div className="h-8 w-24 bg-gray-100 rounded" />
                <div className="h-12 w-full bg-gray-100 rounded-xl" />
                <div className="h-10 w-full bg-gray-100 rounded-lg" />
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-3 w-full bg-gray-100 rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
