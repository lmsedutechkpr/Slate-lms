import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Compass } from 'lucide-react';
import { getWishlist, getStudentEnrolledIds } from '@/lib/actions/wishlist';
import { WishlistGrid } from '@/components/wishlist/WishlistGrid';
import { Profile } from '@/types';

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profileData) redirect('/onboarding');

  const profile = profileData as Profile;

  const [wishlistItems, enrolledIds] = await Promise.all([
    getWishlist(profile.id),
    getStudentEnrolledIds(profile.id),
  ]);

  return (
    <div className="-m-4 lg:-m-8 min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-gray-700 transition-colors">
            Dashboard
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-900">Wishlist</span>
        </div>

        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-gray-900 font-bold text-2xl tracking-tight">
              Wishlist
            </h1>
            <p className="mt-1 text-gray-500 text-sm">
              {wishlistItems.length > 0
                ? `${wishlistItems.length} saved course${wishlistItems.length !== 1 ? 's' : ''}`
                : 'No saved courses yet'}
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <Compass size={14} />
            Browse Courses
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-8 py-8">
        <WishlistGrid
          initialItems={wishlistItems}
          enrolledIds={enrolledIds}
          studentId={profile.id}
          lang={profile.preferred_language}
        />
      </div>
    </div>
  );
}
