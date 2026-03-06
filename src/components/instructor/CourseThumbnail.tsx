'use client';

import React from 'react';
import { BookOpen, GraduationCap, Code, Database, Globe, Layers, Layout, Palette, Terminal } from 'lucide-react';

interface CourseThumbnailProps {
  course: any;
}

const categoryGradients: Record<string, string> = {
  'development': 'from-blue-500 to-indigo-600',
  'design': 'from-pink-500 to-rose-600',
  'business': 'from-emerald-500 to-teal-600',
  'marketing': 'from-amber-500 to-orange-600',
  'lifestyle': 'from-purple-500 to-violet-600',
  'health': 'from-green-500 to-emerald-600',
  'default': 'from-slate-700 to-slate-900',
};

const categoryIcons: Record<string, any> = {
  'development': Code,
  'design': Palette,
  'business': GraduationCap,
  'marketing': Globe,
  'lifestyle': Layers,
  'health': Layout,
  'default': BookOpen,
};

export default function CourseThumbnail({ course }: CourseThumbnailProps) {
  const categorySlug = course.category?.slug?.toLowerCase() || 'default';
  const gradient = categoryGradients[categorySlug] || categoryGradients.default;
  const Icon = categoryIcons[categorySlug] || categoryIcons.default;

  if (course.thumbnail_url) {
    return (
      <img 
        src={course.thumbnail_url} 
        alt={course.title} 
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-6 text-center`}>
      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-3 shadow-xl">
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">
        {course.category?.name || 'COURSE'}
      </div>
      <div className="text-white font-black text-xs leading-tight line-clamp-2 px-4">
        {course.title}
      </div>
    </div>
  );
}
