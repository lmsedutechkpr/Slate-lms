export default function CartLoading() {
  return (
    <div className="-m-4 lg:-m-8 min-h-screen">
      <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-6">
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-3" />
        <div className="h-7 w-24 bg-gray-100 rounded animate-pulse mb-2" />
        <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-5xl">
          <div className="flex-1 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 flex gap-4 animate-pulse">
                <div className="w-20 h-16 bg-gray-100 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
          <div className="w-full lg:w-72 h-64 bg-white border border-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
