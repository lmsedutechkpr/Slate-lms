'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, BookOpen, MoreVertical } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/client';
import { approveCourse, rejectCourse, unpublishCourse, deleteCourse } from '@/lib/actions/admin';
import { toast } from 'sonner';

interface AdminCoursesClientProps {
  initialCourses: any[];
}

export default function AdminCoursesClient({ initialCourses }: AdminCoursesClientProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState(initialCourses);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpenId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const channel = supabase.channel('admin-courses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setCourses(prev => prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c));
        } else if (payload.eventType === 'DELETE') {
          setCourses(prev => prev.filter(c => c.id !== payload.old.id));
        } else if (payload.eventType === 'INSERT') {
          // We can refresh the page to get full data (like joins), or just append basic info. Quickest is to do nothing and rely on manual refresh, but we'll try to keep counts accurate by ignoring for now since it requires joins.
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const counts = {
    all: courses.length,
    pending: courses.filter((c) => c.status === 'pending_review').length,
    published: courses.filter((c) => c.status === 'published').length,
    draft: courses.filter((c) => c.status === 'draft').length,
    rejected: courses.filter((c) => c.status === 'rejected').length,
    archived: courses.filter((c) => c.status === 'archived').length,
  };

  const filteredCourses = courses.filter((c) => {
    const matchesTab = activeTab === 'all' || c.status === activeTab;
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor?.full_name?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleApprove = async (id: string, title: string) => {
    setLoadingAction(`approve-${id}`);
    const result = await approveCourse(id);
    setLoadingAction(null);
    if (result.success) {
      toast.success('Course approved and published');
    } else {
      toast.error(result.error || 'Failed to approve');
    }
    setDropdownOpenId(null);
  };

  const submitReject = async () => {
    if (!rejectingId || !rejectionReason.trim()) return;
    setLoadingAction(`reject-${rejectingId}`);
    const result = await rejectCourse(rejectingId, rejectionReason);
    setLoadingAction(null);
    if (result.success) {
      toast.success('Course rejected');
    } else {
      toast.error(result.error || 'Failed to reject');
    }
    setRejectingId(null);
    setRejectionReason('');
  };

  const handleUnpublish = async (id: string) => {
    setLoadingAction(`unpublish-${id}`);
    const result = await unpublishCourse(id);
    setLoadingAction(null);
    if (result.success) {
      toast.success('Course unpublished (archived)');
    } else {
      toast.error(result.error || 'Failed to unpublish');
    }
    setDropdownOpenId(null);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete course "${title}"? This cannot be undone.`)) return;
    setLoadingAction(`delete-${id}`);
    const result = await deleteCourse(id);
    setLoadingAction(null);
    if (result.success) {
      toast.success('Course deleted');
    } else {
      toast.error(result.error || 'Failed to delete');
    }
    setDropdownOpenId(null);
  };

  return (
    <div className="min-h-full bg-gray-50 relative">
      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-hidden">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 m-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reject Course</h3>
            <p className="text-gray-500 text-sm mb-4">Please provide a reason for rejecting this course. The instructor will see this feedback.</p>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none resize-none"
              rows={4}
              placeholder="e.g. Audio quality in Module 2 needs improvement..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end mt-4">
              <button 
                onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                className="px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                disabled={!rejectionReason.trim() || !!loadingAction}
                onClick={submitReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50"
              >
                {loadingAction === `reject-${rejectingId}` ? 'Rejecting...' : 'Reject Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-400 text-sm mt-1">
              {counts.published} published ·{' '}
              {counts.pending > 0 ? (
                <span className="text-amber-600 font-medium">{counts.pending} pending review</span>
              ) : (
                '0 pending review'
              )}{' '}
              · {counts.all} total
            </p>
          </div>
          <Link 
            href="/instructor/courses/new"
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Create Course
          </Link>
        </div>

        {/* FILTER TABS */}
        <div className="flex items-center gap-1 mt-4 -mb-px overflow-x-auto">
          {[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'pending_review', label: 'Pending Review', count: counts.pending, urgent: true },
            { value: 'published', label: 'Published', count: counts.published },
            { value: 'draft', label: 'Draft', count: counts.draft },
            { value: 'rejected', label: 'Rejected', count: counts.rejected },
            { value: 'archived', label: 'Archived', count: counts.archived },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.value
                  ? 'border-black text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                    tab.urgent && tab.count > 0
                       ? 'bg-amber-100 text-amber-700'
                      : activeTab === tab.value
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6">
        {/* SEARCH */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or instructor name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-gray-900 outline-none bg-white"
            />
          </div>
        </div>

        {/* COURSES TABLE */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-visible">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-semibold uppercase tracking-wide">
            <div className="col-span-4">Course</div>
            <div className="col-span-2 hidden md:block">Instructor</div>
            <div className="col-span-2 hidden lg:block">Category</div>
            <div className="col-span-1 text-center hidden md:block">Price</div>
            <div className="col-span-1 text-center hidden xl:block">Students</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-3 md:col-span-1 text-right">Actions</div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="py-16 text-center">
              <BookOpen className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No courses found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50" ref={dropdownRef}>
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors relative ${
                    course.status === 'pending_review'
                      ? 'bg-amber-50/60 hover:bg-amber-50 border-l-4 border-l-amber-400'
                      : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Course title + thumbnail */}
                  <div className="col-span-6 md:col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 hidden sm:block">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full bg-gradient-to-br ${
                            course.category?.gradient ?? 'from-gray-400 to-gray-600'
                          } flex items-center justify-center`}
                        >
                          <BookOpen className="w-4 h-4 text-white/80" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-900 text-sm font-semibold truncate" title={course.title}>
                        {course.title}
                      </p>
                      {course.status === 'pending_review' && (
                        <p className="text-amber-600 text-[11px] mt-0.5 truncate">
                          Waiting {formatRelativeTime(course.submitted_at)}
                        </p>
                      )}
                      {course.status === 'rejected' && (
                        <p className="text-red-500 text-[11px] mt-0.5 truncate" title={course.rejection_reason}>
                          {course.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* REAL Instructor name + avatar */}
                  <div className="col-span-2 hidden md:flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {course.instructor?.avatar_url ? (
                        <img
                          src={course.instructor.avatar_url}
                          className="w-full h-full object-cover"
                          alt="Instructor"
                        />
                      ) : (
                        <span className="text-gray-600 text-xs font-bold">
                          {course.instructor?.full_name?.[0]?.toUpperCase() ?? '?'}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-700 text-sm truncate" title={course.instructor?.full_name}>
                      {course.instructor?.full_name ?? 'Unknown'}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="col-span-2 hidden lg:block">
                    <span className="text-gray-500 text-sm truncate" title={course.category?.name}>
                      {course.category?.name ?? '—'}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="col-span-1 text-center hidden md:block">
                    <span className="text-gray-700 text-sm font-medium">
                      {course.price === 0 ? (
                        <span className="text-emerald-600">Free</span>
                      ) : (
                        `₹${course.price?.toLocaleString('en-IN')}`
                      )}
                    </span>
                  </div>

                  {/* Students */}
                  <div className="col-span-1 text-center hidden xl:block">
                    <span className="text-gray-700 text-sm">
                      {course.enrollmentCount ?? 0}
                    </span>
                  </div>

                  {/* Status badge */}
                  <div className="col-span-1 flex justify-center text-center">
                    {course.status === 'published' && (
                      <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full px-2.5 py-1">
                        Published
                      </span>
                    )}
                    {course.status === 'pending_review' && (
                      <span className="bg-amber-100 text-amber-700 text-[11px] font-bold rounded-full px-2.5 py-1">
                        In Review
                      </span>
                    )}
                    {course.status === 'draft' && (
                      <span className="bg-gray-100 text-gray-600 text-[11px] font-bold rounded-full px-2.5 py-1">
                        Draft
                      </span>
                    )}
                    {course.status === 'rejected' && (
                      <span className="bg-red-50 text-red-600 text-[11px] font-bold rounded-full px-2.5 py-1">
                        Rejected
                      </span>
                    )}
                    {course.status === 'archived' && (
                      <span className="bg-gray-200 text-gray-700 text-[11px] font-bold rounded-full px-2.5 py-1">
                        Archived
                      </span>
                    )}
                  </div>

                  {/* Actions Dropdown */}
                  <div className="col-span-3 md:col-span-1 flex items-center justify-end relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDropdownOpenId(dropdownOpenId === course.id ? null : course.id); }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {dropdownOpenId === course.id && (
                      <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 shadow-xl rounded-xl z-20 py-1 overflow-hidden">
                        {course.status === 'pending_review' && (
                          <>
                            <button 
                              onClick={() => handleApprove(course.id, course.title)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => { setRejectingId(course.id); setDropdownOpenId(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              Reject
                            </button>
                            <div className="h-px bg-gray-100 my-1"></div>
                          </>
                        )}
                        {course.status === 'published' && (
                          <>
                            <button 
                              onClick={() => handleUnpublish(course.id)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              Unpublish
                            </button>
                            <div className="h-px bg-gray-100 my-1"></div>
                          </>
                        )}
                        <a 
                          href={`/courses/${course.slug}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          View
                        </a>
                        <div className="h-px bg-gray-100 my-1"></div>
                        <button 
                          onClick={() => handleDelete(course.id, course.title)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                        >
                          Delete Course
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
