'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toggleWishlist } from '@/lib/actions/enrollments';
import { useRouter } from 'next/navigation';

interface WishlistRemoveButtonProps {
  courseId: string;
  wishlistId: string;
}

export function WishlistRemoveButton({ courseId, wishlistId }: WishlistRemoveButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await toggleWishlist(courseId);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50 shadow-sm"
      title="Remove from wishlist"
    >
      <Trash2 size={13} className={loading ? 'opacity-40' : ''} />
    </button>
  );
}
