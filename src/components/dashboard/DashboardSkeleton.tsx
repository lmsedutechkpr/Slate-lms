import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-12 pb-20">
      {/* Welcome Section Skeleton */}
      <Skeleton className="h-64 rounded-[2.5rem] w-full" />

      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-[2rem] w-full" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Continue Learning Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-80 rounded-[2.5rem] w-full" />
          </div>

          {/* Recommended Section Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-2xl w-full" />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {/* Activity Feed Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-96 rounded-[2.5rem] w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
