import { ProgressSkeleton } from '@/components/progress/ProgressSkeleton';

export default function ProgressLoading() {
  return (
    <div className="-m-4 lg:-m-8 min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-6 animate-pulse">
        <div className="h-3 w-36 bg-gray-200 rounded mb-3" />
        <div className="h-7 w-40 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-64 bg-gray-100 rounded" />
      </div>
      <div className="px-6 lg:px-8 py-8">
        <ProgressSkeleton />
      </div>
    </div>
  );
}
