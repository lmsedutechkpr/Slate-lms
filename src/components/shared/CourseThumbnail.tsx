import Image from 'next/image';
import {
  BookOpen,
  Palette,
  Camera,
  Globe,
  Monitor,
  Briefcase,
  FlaskConical as Flask,
  Heart,
  TrendingUp,
  Megaphone,
  Paintbrush,
  type LucideIcon,
} from 'lucide-react';
import { Course } from '@/types';
import { cn } from '@/lib/utils';

interface CourseThumbnailProps {
  course?: Partial<Course> | null;
  thumbnailUrl?: string | null;
  title?: string | null;
  categorySlug?: string | null;
  categoryName?: string | null;
  aspectRatio?: 'video' | 'square' | '4/3';
  className?: string;
  priority?: boolean;
}

const categoryGradients: Record<string, string> = {
  'technology':  'from-blue-500 to-indigo-600',
  'design':      'from-purple-500 to-pink-600',
  'business':    'from-emerald-500 to-teal-600',
  'science':     'from-cyan-500 to-blue-600',
  'languages':   'from-orange-500 to-amber-600',
  'health':      'from-green-500 to-emerald-600',
  'arts':        'from-rose-500 to-pink-600',
  'finance':     'from-violet-500 to-purple-600',
  'photography': 'from-yellow-500 to-orange-600',
  'marketing':   'from-red-500 to-rose-600',
}

const categoryIcons: Record<string, LucideIcon> = {
  'technology':  Monitor,
  'design':      Palette,
  'business':    Briefcase,
  'science':     Flask,
  'languages':   Globe,
  'health':      Heart,
  'arts':        Paintbrush,
  'finance':     TrendingUp,
  'photography': Camera,
  'marketing':   Megaphone,
}

const aspectClasses = {
  video:  'aspect-video',
  square: 'aspect-square',
  '4/3':  'aspect-[4/3]',
};

export function CourseThumbnail({ 
  course, 
  thumbnailUrl, 
  title, 
  categorySlug, 
  categoryName,
  aspectRatio = 'video',
  className = '',
  priority = false 
}: CourseThumbnailProps) {
  const finalThumbnailUrl = course?.thumbnail_url ?? thumbnailUrl;
  const finalTitle = course?.title ?? title ?? '';

  // Normalize Supabase joins (they can be objects or arrays)
  const category = Array.isArray(course?.category)
    ? course.category[0]
    : course?.category;

  const finalCategorySlug = category?.slug ?? categorySlug;
  const finalCategoryName = category?.name ?? categoryName;

  const slug = (
    finalCategorySlug ??
    finalCategoryName ??
    ''
  ).toLowerCase();

  const gradient = categoryGradients[slug] ?? 'from-gray-500 to-gray-600';
  const Icon = categoryIcons[slug] ?? BookOpen;

  return (
    <div className={cn("relative w-full h-full overflow-hidden", aspectClasses[aspectRatio], className)}>
      {finalThumbnailUrl ? (
        <Image
          src={finalThumbnailUrl}
          alt={finalTitle}
          fill
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Icon className="text-white/60 w-10 h-10" />
        </div>
      )}
    </div>
  );
}
