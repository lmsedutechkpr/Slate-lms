import { WishlistSkeleton } from '@/components/wishlist/WishlistSkeleton';

export default function WishlistLoading() {
  return (
    <div className="-m-4 lg:-m-8 min-h-screen bg-gray-50">
      <WishlistSkeleton />
    </div>
  );
}
