'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, BookOpen, MoreVertical, Star, AlertCircle, X } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/client';
import { approveCourse, rejectCourse, unpublishCourse, deleteCourse, forcePublishCourse, archiveCourse, toggleFeaturedCourse, bulkPublishCourses, bulkDeleteCourses, createCourseAdmin } from '@/lib/actions/admin';
import AssignInstructorModal from '@/components/admin/courses/AssignInstructorModal';
import CourseDataDrawer from '@/components/admin/courses/CourseDataDrawer';
import EditCourseModal from '@/components/admin/courses/EditCourseModal';
import CreateCourseModal from '@/components/admin/courses/CreateCourseModal';
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
  const [assigningCourseId, setAssigningCourseId] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [drawerState, setDrawerState] = useState<{ id: string; type: 'enrollments' | 'reviews' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab, search]);

  const filteredCourses = courses.filter((c) => {
    const matchesTab = activeTab === 'all' || c.status === activeTab;
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor?.full_name?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const isAllSelected = filteredCourses.length > 0 && selectedIds.size === filteredCourses.length;

  const toggleSelectAll = () => {
    if (isAllSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredCourses.map(c => c.id)));
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkPublish = async () => {
    setLoadingAction('bulkPublish');
    const result = await bulkPublishCourses(Array.from(selectedIds));
    setLoadingAction(null);
    if (result.success) {
      toast.success(`${selectedIds.size} courses published`);
      setSelectedIds(new Set());
    } else {
      toast.error(result.error || 'Failed to publish courses');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} courses?`)) return;
    setLoadingAction('bulkDelete');
    const result = await bulkDeleteCourses(Array.from(selectedIds));
    setLoadingAction(null);
    if (result.success) {
      toast.success(`${selectedIds.size} courses deleted`);
      setSelectedIds(new Set());
    } else {
      toast.error(result.error || 'Failed to delete courses');
    }
  };

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
      toast.success('Course unpublished');
    } else {
      toast.error(result.error || 'Failed to unpublish');
    }
    setDropdownOpenId(null);
  };

  const handleForcePublish = async (id: string) => {
    setLoadingAction(`forcePublish-${id}`);
    const result = await forcePublishCourse(id);
    setLoadingAction(null);
    if (result.success) {
      toast.success('Course force-published');
    } else {
      toast.error(result.error || 'Failed to publish');
    }
    setDropdownOpenId(null);
  };

  const handleArchive = async (id: string) => {
    setLoadingAction(`archive-${id}`);
    const result = await archiveCourse(id);
    setLoadingAction(null);
    if (result.success) {
      toast.success('Course archived');
    } else {
      toast.error(result.error || 'Failed to archive');
    }
    setDropdownOpenId(null);
  };

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    setLoadingAction(`feature-${id}`);
    const result = await toggleFeaturedCourse(id, isFeatured);
    setLoadingAction(null);
    if (result.success) {
      toast.success(isFeatured ? 'Course featured' : 'Course un-featured');
    } else {
      toast.error(result.error || 'Failed to update featured state');
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

      {/* Assign Instructor Modal */}
      {assigningCourseId && (
        <AssignInstructorModal
          courseId={assigningCourseId}
          courseTitle={courses.find(c => c.id === assigningCourseId)?.title || ''}
          currentInstructorId={courses.find(c => c.id === assigningCourseId)?.instructor_id}
          onClose={() => setAssigningCourseId(null)}
          onAssigned={() => setAssigningCourseId(null)}
        />
      )}

      {/* Course Data Drawer */}
      {drawerState && (
        <CourseDataDrawer
          courseId={drawerState.id}
          courseTitle={courses.find(c => c.id === drawerState.id)?.title || ''}
          type={drawerState.type}
          onClose={() => setDrawerState(null)}
        />
      )}

      {/* Edit Course Modal */}
      {editingCourseId && (
        <EditCourseModal
          course={courses.find(c => c.id === editingCourseId)}
          onClose={() => setEditingCourseId(null)}
          onUpdated={() => setEditingCourseId(null)}
        />
      )}

      {/* Create Course Modal */}
      {isCreatingCourse && (
        <CreateCourseModal
          onClose={() => setIsCreatingCourse(false)}
          onSubmit={async (data) => {
            setLoadingAction('create');
            const result = await createCourseAdmin(data);
            setLoadingAction(null);
            if (result.success) {
              toast.success('Course created successfully');
              setIsCreatingCourse(false);
            } else {
              toast.error(result.error || 'Failed to create course');
            }
          }}
          isSubmitting={loadingAction === 'create'}
        />
      )}

      {/* Edit Course Modal */}
      {editingCourseId && (
        <EditCourseModal
          course={courses.find(c => c.id === editingCourseId)}
          onClose={() => setEditingCourseId(null)}
          onUpdated={() => setEditingCourseId(null)}
        />
      )}

      {/* Create Course Modal */}
      {isCreatingCourse && (
        <CreateCourseModal
          onClose={() => setIsCreatingCourse(false)}
          onSubmit={async (data) => {
            setLoadingAction('create');
            const result = await createCourseAdmin(data);
            setLoadingAction(null);
            if (result.success) {
              toast.success('Course created successfully');
              setIsCreatingCourse(false);
            } else {
              toast.error(result.error || 'Failed to create course');
            }
          }}
          isSubmitting={loadingAction === 'create'}
        />
      )}

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-full px-6 py-3 shadow-2xl flex items-center gap-4 z-40 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium bg-white/20 px-2.5 py-1 rounded-full">
            {selectedIds.size} selected
          </span>
          <div className="w-px h-5 bg-gray-700 mx-1" />
          <button 
            onClick={handleBulkPublish}
            disabled={loadingAction === 'bulkPublish'}
            className="text-sm font-semibold hover:text-emerald-400 transition-colors disabled:opacity-50"
          >
            Publish Status
          </button>
          <button 
            onClick={handleBulkDelete}
            disabled={loadingAction === 'bulkDelete'}
            className="text-sm font-semibold hover:text-red-400 transition-colors disabled:opacity-50"
          >
            Delete Courses
          </button>
          <button 
            onClick={() => setSelectedIds(new Set())}
            className="text-gray-400 hover:text-white ml-2 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
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
          <button 
            onClick={() => setIsCreatingCourse(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Create Course
          </button>
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
            <div className="col-span-4 flex items-center gap-3">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                checked={isAllSelected}
                onChange={toggleSelectAll}
              />
              <span>Course</span>
            </div>
            <div className="col-span-2 hidden md:block">Instructor</div>
            <div className="col-span-2 hidden lg:block">Category</div>
            <div className="col-span-1 text-center hidden md:block">Price</div>
            <div className="col-span-1 text-center hidden xl:block">Rating</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-1 text-right">Actions</div>
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
                    <input 
                      type="checkbox" 
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelect(course.id)}
                      checked={selectedIds.has(course.id)}
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer flex-shrink-0"
                    />
                    <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 hidden sm:block relative">
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
                      {course.is_featured && (
                        <span className="absolute -top-1 -right-1 text-yellow-400 text-xs drop-shadow-sm">⭐</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-900 text-sm font-semibold truncate" title={course.title}>
                        {course.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        <span className="capitalize">{course.difficulty || 'Beginner'}</span> · {course.total_lectures || 0} lectures · {course.duration_minutes || 0}m
                      </p>
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
                    {course.price === 0 ? (
                      <span className="text-emerald-600 font-medium text-sm">Free</span>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-gray-900 text-sm font-medium">₹{course.price?.toLocaleString('en-IN')}</span>
                        {course.original_price > course.price && (
                          <span className="text-xs text-gray-400 line-through">₹{course.original_price?.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="col-span-1 text-center hidden xl:flex justify-center flex-col items-center">
                    {course.rating_count > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium text-gray-900">{course.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-xs text-gray-400 ml-0.5">({course.rating_count})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No reviews</span>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="col-span-1 flex justify-center items-center text-center">
                    {course.status === 'published' && (
                      <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full px-2.5 py-1">
                        Live
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
                    {course.status === 'unpublished' && ( // Phase 3 archive logic
                      <span className="bg-gray-200 text-gray-700 text-[11px] font-bold rounded-full px-2.5 py-1">
                        Archived
                      </span>
                    )}
                    {course.status === 'rejected' && (
                      <div className="flex items-center gap-1.5">
                        <span className="bg-red-50 text-red-600 text-[11px] font-bold rounded-full px-2.5 py-1">
                          Rejected
                        </span>
                        {course.rejection_reason && (
                          <div className="relative group inline-flex">
                            <AlertCircle className="w-4 h-4 text-red-400 cursor-help hover:text-red-500 transition-colors" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg text-left">
                              {course.rejection_reason}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                            </div>
                          </div>
                        )}
                      </div>
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
                      <>
                        {/* Mobile Backdrop */}
                        <div 
                          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
                          onClick={(e) => { e.stopPropagation(); setDropdownOpenId(null); }}
                        />
                        <div className="fixed md:absolute bottom-0 md:bottom-auto left-0 md:left-auto right-0 md:top-10 w-full md:w-56 bg-white border-t md:border border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-xl rounded-t-2xl md:rounded-xl z-50 py-2 md:py-1 overflow-hidden animate-in slide-in-from-bottom-5 md:slide-in-from-top-2">
                          {/* Mobile pull indicator */}
                          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2 md:hidden" />
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
                        {course.status !== 'published' && course.status !== 'pending_review' && (
                          <button 
                            onClick={() => handleForcePublish(course.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            Force Publish
                          </button>
                        )}
                        {course.status !== 'archived' && course.status !== 'unpublished' && ( // Added safety check
                          <button 
                            onClick={() => handleArchive(course.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            Archive Course
                          </button>
                        )}
                        <button 
                          onClick={() => handleToggleFeatured(course.id, !course.is_featured)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          {course.is_featured ? 'Remove Featured' : 'Feature Course'}
                        </button>
                        <div className="h-px bg-gray-100 my-1"></div>
                        <button 
                          onClick={() => { setAssigningCourseId(course.id); setDropdownOpenId(null); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          Assign Instructor
                        </button>
                        <button 
                          onClick={() => { setDrawerState({ id: course.id, type: 'enrollments' }); setDropdownOpenId(null); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          View Enrollments
                        </button>
                        <button 
                          onClick={() => { setDrawerState({ id: course.id, type: 'reviews' }); setDropdownOpenId(null); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          View Reviews
                        </button>
                        <button 
                          onClick={() => { setEditingCourseId(course.id); setDropdownOpenId(null); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          Edit Course Info
                        </button>
                        <a 
                          href={`/courses/${course.slug}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          View in Store
                        </a>
                        <div className="h-px bg-gray-100 my-1"></div>
                        <button 
                          onClick={() => handleDelete(course.id, course.title)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                        >
                          Delete Course
                        </button>
                      </div>
                      </>
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
