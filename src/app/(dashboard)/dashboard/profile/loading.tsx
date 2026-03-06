import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';

export default function ProfileLoading() {
  return (
    <div className="-m-4 lg:-m-8 min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-6 animate-pulse">
        <div className="h-3 w-36 bg-gray-200 rounded mb-3" />
        <div className="h-7 w-32 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-52 bg-gray-100 rounded" />
      </div>
      <div className="px-6 lg:px-8 py-8">
        <div className="max-w-2xl">
          <ProfileSkeleton />
        </div>
      </div>
    </div>
  );
}
