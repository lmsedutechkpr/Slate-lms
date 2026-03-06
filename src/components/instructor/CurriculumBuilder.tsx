'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  FileText,
  HelpCircle,
  Pencil,
  CheckCircle2,
  Circle,
  MoreVertical,
  X,
  Loader2,
  Check,
  Video,
  Clock,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  createSection,
  updateSection,
  deleteSection,
  createLecture,
  deleteLecture,
} from '@/lib/actions/instructor';
import LectureEditorPanel from './LectureEditorPanel';
import CourseStatusBadge from './CourseStatusBadge';
import { InstructorBreadcrumb } from './InstructorBreadcrumb';
import SubmitForReviewButton from './SubmitForReviewButton';
import { CourseThumbnail } from '@/components/shared/CourseThumbnail';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface CurriculumBuilderProps {
  courseId: string;
  instructorId: string;
  initialSections: any[];
  course: any;
  checklist: any;
}

export default function CurriculumBuilder({
  courseId,
  instructorId,
  initialSections,
  course,
  checklist,
}: CurriculumBuilderProps) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(initialSections.map((s) => s.id))
  );
  const [editingLecture, setEditingLecture] = useState<any | null>(null);
  const [addingLectureToSectionId, setAddingLectureToSectionId] = useState<string | null>(null);
  const [newLectureTitle, setNewLectureTitle] = useState('');
  const [newLectureType, setNewLectureType] = useState<'video' | 'text' | 'quiz'>('video');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState<'curriculum' | 'info'>('curriculum');

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const handleCreateSection = async () => {
    if (!newSectionTitle.trim()) return;
    const title = newSectionTitle.trim();
    const tempId = `temp-${Date.now()}`;
    const tempSection = {
      id: tempId,
      title,
      order_index: sections.length,
      lectures: [],
    };

    // Optimistic update
    setSections((prev) => [...prev, tempSection]);
    setExpandedSections((prev) => new Set([...prev, tempId]));
    setNewSectionTitle('');
    setAddingSection(false);

    setLoading(true);
    try {
      const result = await createSection(courseId, instructorId, title);
      if (result.success) {
        // Replace temp ID with real ID
        setSections((prev) =>
          prev.map((s) => (s.id === tempId ? { ...s, id: result.sectionId! } : s))
        );
        setExpandedSections((prev) => {
          const next = new Set(prev);
          next.delete(tempId);
          next.add(result.sectionId!);
          return next;
        });
        toast.success('Section created');
        router.refresh();
      } else {
        // Revert
        setSections((prev) => prev.filter((s) => s.id !== tempId));
        toast.error('Failed to create section', { description: result.error });
      }
    } catch {
      setSections((prev) => prev.filter((s) => s.id !== tempId));
      toast.error('Failed to create section');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSection = async (sectionId: string) => {
    if (!editSectionTitle.trim()) {
      setEditingSectionId(null);
      return;
    }
    const newTitle = editSectionTitle.trim();
    const prevSections = sections;

    // Optimistic update
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, title: newTitle } : s))
    );
    setEditingSectionId(null);

    try {
      const result = await updateSection(sectionId, instructorId, { title: newTitle });
      if (result.success) {
        toast.success('Section updated');
        router.refresh();
      } else {
        setSections(prevSections);
        toast.error('Failed to update section', { description: result.error });
      }
    } catch {
      setSections(prevSections);
      toast.error('Failed to update section');
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Delete this section and all its lectures?')) return;
    const prevSections = sections;

    // Optimistic removal
    setSections((prev) => prev.filter((s) => s.id !== sectionId));

    try {
      const result = await deleteSection(sectionId, instructorId);
      if (result.success) {
        toast.success('Section deleted');
        router.refresh();
      } else {
        setSections(prevSections);
        toast.error('Failed to delete section', { description: result.error });
      }
    } catch {
      setSections(prevSections);
      toast.error('Failed to delete section');
    }
  };

  const handleCreateLecture = async (sectionId: string) => {
    if (!newLectureTitle.trim()) return;
    const title = newLectureTitle.trim();
    const type = newLectureType;
    const tempId = `temp-${Date.now()}`;
    const section = sections.find((s) => s.id === sectionId);
    const tempLecture = {
      id: tempId,
      title,
      content_type: type,
      order_index: section?.lectures?.length ?? 0,
      video_url: null,
      duration_minutes: 0,
      is_free_preview: false,
    };

    // Optimistic update
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, lectures: [...(s.lectures ?? []), tempLecture] }
          : s
      )
    );
    setNewLectureTitle('');
    setAddingLectureToSectionId(null);

    setLoading(true);
    try {
      const result = await createLecture(sectionId, instructorId, {
        title,
        content_type: type,
      });
      if (result.success) {
        // Replace temp ID with real ID
        setSections((prev) =>
          prev.map((s) =>
            s.id === sectionId
              ? {
                  ...s,
                  lectures: (s.lectures ?? []).map((l: any) =>
                    l.id === tempId ? { ...l, id: result.lectureId! } : l
                  ),
                }
              : s
          )
        );
        toast.success('Lecture created');
        router.refresh();
      } else {
        // Revert
        setSections((prev) =>
          prev.map((s) =>
            s.id === sectionId
              ? { ...s, lectures: (s.lectures ?? []).filter((l: any) => l.id !== tempId) }
              : s
          )
        );
        toast.error('Failed to create lecture', { description: result.error });
      }
    } catch {
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, lectures: (s.lectures ?? []).filter((l: any) => l.id !== tempId) }
            : s
        )
      );
      toast.error('Failed to create lecture');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLecture = async (lectureId: string) => {
    if (!confirm('Delete this lecture?')) return;
    const prevSections = sections;

    // Optimistic removal
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        lectures: (s.lectures ?? []).filter((l: any) => l.id !== lectureId),
      }))
    );

    try {
      const result = await deleteLecture(lectureId, instructorId);
      if (result.success) {
        toast.success('Lecture deleted');
        router.refresh();
      } else {
        setSections(prevSections);
        toast.error('Failed to delete lecture', { description: result.error });
      }
    } catch {
      setSections(prevSections);
      toast.error('Failed to delete lecture');
    }
  };

  // Computed stats from live sections state
  const sectionCount = sections.length;
  const lectureCount = sections.reduce((sum, s) => sum + (s.lectures?.length || 0), 0);
  const totalMinutes = sections.reduce(
    (sum, s) =>
      sum +
      (s.lectures?.reduce((ls: number, l: any) => ls + (l.duration_minutes || 0), 0) || 0),
    0
  );

  // Real checklist items derived from course DB data
  const checklistItems = [
    {
      id: 'title',
      label: 'Course title',
      hint:
        (course.title?.trim().length ?? 0) < 10
          ? `Need ${10 - (course.title?.length ?? 0)} more char${10 - (course.title?.length ?? 0) !== 1 ? 's' : ''}`
          : null,
      done: (course.title?.trim().length ?? 0) >= 10,
      href: `/instructor/courses/${courseId}/edit`,
    },
    {
      id: 'description',
      label: 'Description written',
      hint:
        (course.description?.trim().length ?? 0) < 50
          ? `Need ${50 - (course.description?.length ?? 0)} more chars`
          : null,
      done: (course.description?.trim().length ?? 0) >= 50,
      href: `/instructor/courses/${courseId}/edit`,
    },
    {
      id: 'category',
      label: 'Category selected',
      hint: 'Choose a category',
      done: !!course.category_id,
      href: `/instructor/courses/${courseId}/edit`,
    },
    {
      id: 'thumbnail',
      label: 'Thumbnail uploaded',
      hint: 'Upload a cover image',
      done: !!course.thumbnail_url,
      href: `/instructor/courses/${courseId}/edit`,
    },
    {
      id: 'what_you_learn',
      label: `Learning outcomes (${course.what_you_learn?.length ?? 0}/4)`,
      hint:
        (course.what_you_learn?.length ?? 0) < 4
          ? `Add ${4 - (course.what_you_learn?.length ?? 0)} more outcome${4 - (course.what_you_learn?.length ?? 0) !== 1 ? 's' : ''}`
          : null,
      done: (course.what_you_learn?.length ?? 0) >= 4,
      href: `/instructor/courses/${courseId}/edit`,
    },
    {
      id: 'sections',
      label: `Sections (${sectionCount}/1 min)`,
      hint: 'Create at least 1 section',
      done: sectionCount >= 1,
      href: null,
    },
    {
      id: 'lectures',
      label: `Lectures (${lectureCount}/3 min)`,
      hint:
        lectureCount < 3
          ? `Add ${3 - lectureCount} more lecture${3 - lectureCount !== 1 ? 's' : ''}`
          : null,
      done: lectureCount >= 3,
      href: null,
    },
    {
      id: 'price',
      label: 'Pricing set',
      hint: 'Set free or paid price',
      done: course.price !== null && course.price !== undefined && course.price >= 0,
      href: `/instructor/courses/${courseId}/edit`,
    },
  ];

  const completedCount = checklistItems.filter((i) => i.done).length;
  const allDone = completedCount === 8;

  // ─── LEFT PANEL ──────────────────────────────────────────────
  const leftPanel = (
    <aside
      className={`
        bg-white border-r border-gray-200 flex flex-col overflow-hidden flex-shrink-0
        md:w-80 md:flex
        w-full
        ${mobileTab === 'info' ? 'flex' : 'hidden md:flex'}
      `}
    >
      {/* TOP — Course info + stats */}
      <div className="flex-shrink-0 border-b border-gray-100">
        {/* Thumbnail + title + category */}
        <div className="px-5 pt-5 pb-4">
          <div
            className="relative w-full rounded-xl overflow-hidden mb-3"
            style={{ aspectRatio: '16/9' }}
          >
            {course.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <CourseThumbnail course={course} />
            )}
          </div>

          <h3 className="text-gray-900 font-semibold text-sm leading-snug line-clamp-2">
            {course.title}
          </h3>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-400 text-xs">
              {course.category?.name ?? 'No category'}
            </span>
            <span className="text-gray-200 text-xs">·</span>
            <CourseStatusBadge status={course.status} size="sm" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 text-center border-t border-gray-100 py-3">
          <div>
            <p className="text-gray-900 font-bold text-base">{sectionCount}</p>
            <p className="text-gray-400 text-[10px] uppercase tracking-wide mt-0.5">Sections</p>
          </div>
          <div className="border-x border-gray-100">
            <p className="text-gray-900 font-bold text-base">{lectureCount}</p>
            <p className="text-gray-400 text-[10px] uppercase tracking-wide mt-0.5">Lectures</p>
          </div>
          <div>
            <p className="text-gray-900 font-bold text-base">
              {totalMinutes > 0 ? `${totalMinutes}m` : '0m'}
            </p>
            <p className="text-gray-400 text-[10px] uppercase tracking-wide mt-0.5">Content</p>
          </div>
        </div>
      </div>

      {/* MIDDLE — Scrollable checklist */}
      <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">
            Publish Checklist
          </p>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              completedCount === 8
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {completedCount}/8
          </span>
        </div>

        <div className="space-y-3">
          {checklistItems.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-medium leading-snug ${
                    item.done ? 'text-gray-700' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </p>
                {!item.done && item.hint && (
                  <p className="text-gray-400 text-[11px] mt-0.5 leading-tight">{item.hint}</p>
                )}
              </div>
              {!item.done && item.href && (
                <Link href={item.href}>
                  <span className="text-gray-400 text-[11px] hover:text-gray-700 flex-shrink-0 mt-0.5 whitespace-nowrap">
                    Fix →
                  </span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM — Submit, always visible */}
      <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50 px-5 py-4">
        {course.status === 'draft' && (
          <div
            className={`rounded-xl p-3 mb-3 ${
              allDone
                ? 'bg-emerald-50 border border-emerald-200'
                : 'bg-amber-50 border border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {allDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
              <p
                className={`text-xs font-semibold ${
                  allDone ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {allDone
                  ? 'Ready to submit!'
                  : `${8 - completedCount} item${8 - completedCount !== 1 ? 's' : ''} remaining`}
              </p>
            </div>
            <p className={`text-[11px] mt-1 ${allDone ? 'text-emerald-600' : 'text-amber-600'}`}>
              {allDone
                ? 'All requirements met. Ready to go!'
                : 'Complete the checklist to submit.'}
            </p>
          </div>
        )}

        {course.status === 'pending_review' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-center">
            <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-amber-700 text-xs font-semibold">Under Review</p>
            <p className="text-amber-600 text-[11px] mt-0.5">1–3 business days</p>
          </div>
        )}

        {course.status === 'published' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-emerald-700 text-xs font-semibold">Live on Slate</p>
            <Link href={`/courses/${course.slug}`} target="_blank">
              <span className="text-emerald-600 text-[11px] hover:underline">
                View course →
              </span>
            </Link>
          </div>
        )}

        {course.status === 'draft' && (
          <SubmitForReviewButton
            courseId={courseId}
            instructorId={instructorId}
            isReady={allDone}
          />
        )}

        <Link href={`/instructor/courses/${courseId}`}>
          <button className="w-full mt-2 text-gray-400 text-xs flex items-center justify-center gap-1 hover:text-gray-600 py-1 transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Course Overview
          </button>
        </Link>
      </div>
    </aside>
  );

  // ─── RIGHT PANEL ─────────────────────────────────────────────
  const rightPanel = (
    <main
      className={`
        flex-1 flex flex-col overflow-hidden bg-gray-50
        ${mobileTab === 'curriculum' ? 'flex' : 'hidden md:flex'}
        md:flex
      `}
    >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <InstructorBreadcrumb items={[
              { label: 'My Courses', href: '/instructor/courses' },
              { label: course.title, href: `/instructor/courses/${courseId}` },
              { label: 'Curriculum' },
            ]} />
            <h1 className="text-gray-900 font-bold text-lg md:text-xl">Sections & Lectures</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {sectionCount} section{sectionCount !== 1 ? 's' : ''} ·{' '}
              {lectureCount} lecture{lectureCount !== 1 ? 's' : ''} · {totalMinutes}m total
            </p>
          </div>
        <button
          onClick={() => setAddingSection(true)}
          className="bg-black text-white rounded-xl px-3 md:px-4 py-2 text-sm font-semibold flex items-center gap-2 hover:bg-gray-800 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Section</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Scrollable curriculum */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-4">
          {sections.map((section, sIndex) => (
            <div
              key={section.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Section header */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-3 rounded-t-2xl">
                <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 cursor-grab" />

                <span className="bg-gray-900 text-white text-[11px] font-bold rounded-md px-2 py-0.5 flex-shrink-0">
                  S{sIndex + 1}
                </span>

                {editingSectionId === section.id ? (
                  <input
                    autoFocus
                    value={editSectionTitle}
                    onChange={(e) => setEditSectionTitle(e.target.value)}
                    onBlur={() => handleUpdateSection(section.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateSection(section.id);
                      if (e.key === 'Escape') setEditingSectionId(null);
                    }}
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold focus:border-gray-900 outline-none"
                  />
                ) : (
                  <span
                    onClick={() => {
                      setEditingSectionId(section.id);
                      setEditSectionTitle(section.title);
                    }}
                    className="flex-1 text-gray-900 font-semibold text-sm cursor-text hover:text-gray-600 transition-colors truncate"
                  >
                    {section.title}
                  </span>
                )}

                <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                  <span className="text-gray-400 text-xs hidden sm:block">
                    {section.lectures?.length ?? 0} lecture
                    {(section.lectures?.length ?? 0) !== 1 ? 's' : ''}
                  </span>

                  <button
                    onClick={() => {
                      setAddingLectureToSectionId(section.id);
                      setNewLectureTitle('');
                    }}
                    className="flex items-center gap-1 text-gray-500 text-xs hover:text-gray-900 transition-colors px-2 py-1 rounded-lg hover:bg-gray-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Add Lecture</span>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-white transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-gray-100 w-44 shadow-2xl">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingSectionId(section.id);
                          setEditSectionTitle(section.title);
                        }}
                        className="font-semibold py-2.5"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteSection(section.id)}
                        className="text-red-600 font-semibold py-2.5 focus:text-red-700 focus:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        Delete Section
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <button
                    onClick={() => toggleSection(section.id)}
                    className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors"
                  >
                    {expandedSections.has(section.id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Lectures */}
              {expandedSections.has(section.id) && (
                <div>
                  {section.lectures?.map((lecture: any) => (
                    <div
                      key={lecture.id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 group transition-colors"
                    >
                      <GripVertical className="w-4 h-4 text-gray-200 flex-shrink-0 cursor-grab group-hover:text-gray-400 transition-colors" />

                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          lecture.content_type === 'video'
                            ? 'bg-blue-50 text-blue-500'
                            : lecture.content_type === 'text'
                            ? 'bg-emerald-50 text-emerald-500'
                            : 'bg-amber-50 text-amber-500'
                        }`}
                      >
                        {lecture.content_type === 'video' ? (
                          <PlayCircle className="w-4 h-4" />
                        ) : lecture.content_type === 'text' ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <HelpCircle className="w-4 h-4" />
                        )}
                      </div>

                      <span className="flex-1 text-gray-700 text-sm truncate min-w-0">
                        {lecture.title}
                      </span>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {lecture.is_free_preview && (
                          <span className="bg-blue-50 text-blue-600 text-[10px] font-medium rounded-full px-2 py-0.5 hidden sm:inline">
                            Free Preview
                          </span>
                        )}

                        {lecture.content_type === 'video' &&
                          (lecture.video_url ? (
                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-medium rounded-full px-2 py-0.5 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" />
                              <span className="hidden sm:inline">Video added</span>
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-600 text-[10px] font-medium rounded-full px-2 py-0.5">
                              No video
                            </span>
                          ))}

                        {(lecture.duration_minutes ?? 0) > 0 && (
                          <span className="text-gray-400 text-xs">
                            {lecture.duration_minutes}m
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => setEditingLecture(lecture)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLecture(lecture.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Inline add lecture form */}
                  {addingLectureToSectionId === section.id ? (
                    <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-gray-50 border-t border-gray-100">
                      <Plus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        autoFocus
                        value={newLectureTitle}
                        onChange={(e) => setNewLectureTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateLecture(section.id);
                          if (e.key === 'Escape') {
                            setAddingLectureToSectionId(null);
                            setNewLectureTitle('');
                          }
                        }}
                        placeholder="Lecture title..."
                        className="flex-1 min-w-[160px] bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-gray-900 outline-none"
                      />
                      <select
                        value={newLectureType}
                        onChange={(e) => setNewLectureType(e.target.value as any)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-gray-900 outline-none bg-white"
                      >
                        <option value="video">Video</option>
                        <option value="text">Article</option>
                        <option value="quiz">Quiz</option>
                      </select>
                      <button
                        onClick={() => handleCreateLecture(section.id)}
                        disabled={!newLectureTitle.trim() || loading}
                        className="bg-black text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                      >
                        {loading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setAddingLectureToSectionId(null);
                          setNewLectureTitle('');
                        }}
                        className="text-gray-400 text-sm hover:text-gray-700 transition-colors px-2 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAddingLectureToSectionId(section.id);
                        setNewLectureTitle('');
                      }}
                      className="w-full py-3 px-4 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 group/add border-t border-gray-50"
                    >
                      <div className="w-7 h-7 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 group-hover/add:border-gray-400 group-hover/add:text-gray-500 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-medium text-gray-400 group-hover/add:text-gray-600 transition-colors">
                        Add Lecture
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add Section form / button */}
          {addingSection ? (
            <div className="bg-white border-2 border-black p-6 rounded-2xl shadow-xl animate-in slide-in-from-bottom-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 block">
                Section Title
              </Label>
              <Input
                autoFocus
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateSection();
                  if (e.key === 'Escape') setAddingSection(false);
                }}
                placeholder="e.g. Getting Started"
                className="h-12 bg-gray-50 border-gray-100 rounded-xl mb-4 font-semibold text-base focus:border-black"
              />
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setAddingSection(false)}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600 uppercase tracking-widest px-4 py-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={loading || !newSectionTitle.trim()}
                  onClick={handleCreateSection}
                  className="bg-black text-white px-8 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Create Section
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingSection(true)}
              className="w-full py-10 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-300 hover:border-gray-400 hover:text-gray-500 hover:bg-white transition-all group"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-white transition-all">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-widest">Add New Section</span>
            </button>
          )}
        </div>
      </div>
    </main>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Mobile tab switcher */}
      <div className="md:hidden flex border-b border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={() => setMobileTab('curriculum')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            mobileTab === 'curriculum'
              ? 'border-black text-gray-900'
              : 'border-transparent text-gray-400'
          }`}
        >
          Curriculum
        </button>
        <button
          onClick={() => setMobileTab('info')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            mobileTab === 'info'
              ? 'border-black text-gray-900'
              : 'border-transparent text-gray-400'
          }`}
        >
          Course Info
        </button>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {leftPanel}
        {rightPanel}
      </div>

      {/* Lecture Editor Panel — side panel on desktop, bottom sheet on mobile */}
      <>
        {/* Mobile overlay */}
        {editingLecture && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setEditingLecture(null)}
          />
        )}
        <LectureEditorPanel
          lecture={editingLecture}
          instructorId={instructorId}
          isOpen={!!editingLecture}
          onClose={() => setEditingLecture(null)}
          onSave={(updatedLecture?: any) => {
            if (updatedLecture) {
              // Optimistically update the lecture in local state
              setSections((prev) =>
                prev.map((section) => ({
                  ...section,
                  lectures: (section.lectures ?? []).map((l: any) =>
                    l.id === updatedLecture.id ? { ...l, ...updatedLecture } : l
                  ),
                }))
              );
            }
            setEditingLecture(null);
            router.refresh();
          }}
        />
      </>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ddd; }
      `}</style>
    </div>
  );
}
