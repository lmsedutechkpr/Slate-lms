'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Star,
  BookOpen,
  Pencil,
  ExternalLink,
  BarChart2,
  AlertCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { CourseThumbnail } from '@/components/shared/CourseThumbnail';
import CourseStatusBadge from './CourseStatusBadge';

interface InstructorCourseCardProps {
  course: any;
}

export default function InstructorCourseCard({ course }: InstructorCourseCardProps) {
  const {
    id,
    title,
    slug,
    status,
    category,
    difficulty,
    enrollmentCount = 0,
    rating = 0,
    lectureCount = 0,
    revenue = 0,
  } = course;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col">

      {/* ZONE 1 — Clickable body → Course Overview */}
      <Link href={`/instructor/courses/${id}`} className="block group">
        {/* Thumbnail */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <CourseThumbnail course={course} className="group-hover:scale-105 transition-transform duration-300" />

          {/* Status badge overlay */}
          <div className="absolute top-3 left-3 z-10">
            <CourseStatusBadge status={status} />
          </div>

          {/* Revenue badge */}
          {revenue > 0 && (
            <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-semibold rounded-lg px-2.5 py-1 backdrop-blur-sm z-10">
              ₹{revenue.toLocaleString('en-IN')}
            </div>
          )}

          {/* Hover overlay with "View Details" pill */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
            <div className="bg-white/90 text-gray-900 text-xs font-semibold rounded-full px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 shadow-sm">
              <Eye className="w-3.5 h-3.5" />
              View Details
            </div>
          </div>
        </div>

        {/* Card info */}
        <div className="px-4 py-4 pb-3">
          {/* Category + Difficulty */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-gray-400 text-xs uppercase tracking-wide font-medium">
              {category?.name ?? 'Uncategorized'}
            </span>
            <span className="text-gray-200 text-xs">·</span>
            <span className="text-gray-400 text-xs capitalize">{difficulty ?? 'beginner'}</span>
          </div>

          {/* Title */}
          <h3 className="text-gray-900 font-semibold text-base line-clamp-2 leading-snug mb-3 group-hover:text-gray-700 transition-colors">
            {title}
          </h3>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {enrollmentCount} students
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {lectureCount} lectures
            </span>
            {rating > 0 ? (
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {rating.toFixed(1)}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5" />
                No ratings
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Separator */}
      <div className="border-t border-gray-100 mx-4" />

      {/* ZONE 2 — Action buttons (separate click zone) */}
      <div className="flex gap-2 p-4">
        {(status === 'draft' || status === 'rejected') && (
          <>
            <Link href={`/instructor/courses/${id}/edit`} className="flex-1">
              <button className="w-full border border-gray-200 text-gray-700 rounded-xl py-2 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors">
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
            </Link>
            <Link href={`/instructor/courses/${id}/curriculum`} className="flex-1">
              <button className="w-full bg-black text-white rounded-xl py-2 text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-gray-800 transition-colors">
                <BookOpen className="w-3.5 h-3.5" />
                Curriculum
              </button>
            </Link>
          </>
        )}

        {status === 'pending_review' && (
          <>
            <Link href={`/instructor/courses/${id}/curriculum`} className="flex-1">
              <button className="w-full border border-gray-200 text-gray-700 rounded-xl py-2 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors">
                <BookOpen className="w-3.5 h-3.5" />
                Curriculum
              </button>
            </Link>
            <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl py-2 px-3 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-amber-700 text-sm font-medium">Under Review</span>
            </div>
          </>
        )}

        {status === 'published' && (
          <>
            <Link href={`/courses/${slug}`} target="_blank" className="flex-1">
              <button className="w-full border border-gray-200 text-gray-700 rounded-xl py-2 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
                View
              </button>
            </Link>
            <Link href={`/instructor/courses/${id}/analytics`} className="flex-1">
              <button className="w-full bg-black text-white rounded-xl py-2 text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-gray-800 transition-colors">
                <BarChart2 className="w-3.5 h-3.5" />
                Analytics
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
