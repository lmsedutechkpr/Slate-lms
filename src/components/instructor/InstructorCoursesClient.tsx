'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  BookPlus,
  Globe,
  FileText,
  Clock,
  XCircle,
} from 'lucide-react';
import InstructorCourseCard from './InstructorCourseCard';

interface InstructorCoursesClientProps {
  courses: any[];
  activeStatus: string;
  counts: {
    all: number;
    published: number;
    draft: number;
    pending: number;
    rejected: number;
  };
}

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'In Review' },
  { value: 'rejected', label: 'Rejected' },
];

function EmptyState({ status }: { status: string }) {
  const messages: Record<string, any> = {
    all: {
      Icon: BookPlus,
      title: 'No courses yet',
      desc: 'Create your first course to start teaching.',
      cta: 'Create Course',
      href: '/instructor/courses/new',
    },
    published: {
      Icon: Globe,
      title: 'No published courses',
      desc: 'Submit your drafts for review to get published.',
      cta: 'View Drafts',
      href: '/instructor/courses?status=draft',
    },
    draft: {
      Icon: FileText,
      title: 'No draft courses',
      desc: 'All your courses have been submitted.',
      cta: 'Create New',
      href: '/instructor/courses/new',
    },
    pending_review: {
      Icon: Clock,
      title: 'No courses under review',
      desc: 'Submit a draft course for admin review.',
      cta: 'View Drafts',
      href: '/instructor/courses?status=draft',
    },
    rejected: {
      Icon: XCircle,
      title: 'No rejected courses',
      desc: "Great! All your submissions have been approved.",
      cta: null,
      href: null,
    },
  };

  const msg = messages[status] ?? messages.all;
  const { Icon } = msg;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-gray-900 font-semibold text-base mb-1">{msg.title}</h3>
      <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-5">{msg.desc}</p>
      {msg.cta && msg.href && (
        <Link href={msg.href}>
          <button className="bg-black text-white rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" />
            {msg.cta}
          </button>
        </Link>
      )}
    </div>
  );
}

export default function InstructorCoursesClient({
  courses,
  activeStatus,
  counts,
}: InstructorCoursesClientProps) {
  const [search, setSearch] = useState('');

  const tabCounts: Record<string, number> = {
    all: counts.all,
    published: counts.published,
    draft: counts.draft,
    pending_review: counts.pending,
    rejected: counts.rejected,
  };

  const filtered = search.trim()
    ? courses.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.category?.name ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : courses;

  return (
    <div className="min-h-full bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-400 text-sm mt-1">
              {counts.all} course{counts.all !== 1 ? 's' : ''} · {counts.published} published
            </p>
          </div>
          <Link href="/instructor/courses/new">
            <button className="bg-black text-white rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" />
              Create Course
            </button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 mt-5 border-b border-gray-100 -mb-px overflow-x-auto">
          {TABS.map((tab) => {
            const count = tabCounts[tab.value] ?? 0;
            const isActive = activeStatus === tab.value;
            return (
              <Link
                key={tab.value}
                href={
                  tab.value === 'all'
                    ? '/instructor/courses'
                    : `/instructor/courses?status=${tab.value}`
                }
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
                  isActive
                    ? 'border-black text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                      isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="px-8 py-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-gray-900 outline-none bg-white transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="px-8 pb-8">
        {filtered.length === 0 ? (
          <EmptyState status={search ? 'all' : activeStatus} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((course) => (
              <InstructorCourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
