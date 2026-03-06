'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  Lock,
  Menu,
  X,
  Clock,
  BookOpen,
  Award,
} from 'lucide-react';
import { Course, CourseSection, Lecture, LectureProgress, Enrollment } from '@/types';
import { cn } from '@/lib/utils';
import { markLectureComplete } from '@/lib/actions/learn';
import { VideoPlayer } from '@/components/learn/VideoPlayer';

interface CoursePlayerProps {
  course: Course;
  sections: CourseSection[];
  enrollment: Enrollment;
  progressMap: Record<string, LectureProgress>;
  userId: string;
}

export function CoursePlayer({
  course,
  sections,
  enrollment,
  progressMap,
  userId,
}: CoursePlayerProps) {
  const allLectures = sections.flatMap((s) => s.lectures ?? []);

  // Find the first incomplete lecture, or default to first
  const firstIncomplete =
    allLectures.find((l) => !progressMap[l.id]?.is_completed) ?? allLectures[0] ?? null;

  const [activeLecture, setActiveLecture] = useState<Lecture | null>(firstIncomplete);
  const [localProgress, setLocalProgress] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const [id, p] of Object.entries(progressMap)) {
      map[id] = p.is_completed;
    }
    return map;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(sections.map((s) => s.id))
  );
  const [markingComplete, setMarkingComplete] = useState(false);

  const completedCount = Object.values(localProgress).filter(Boolean).length;
  const totalLectures = allLectures.length;
  const overallPercent = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId);
      return next;
    });
  };

  const handleLectureSelect = (lecture: Lecture) => {
    setActiveLecture(lecture);
  };

  const handleMarkComplete = useCallback(async () => {
    if (!activeLecture || markingComplete) return;
    setMarkingComplete(true);
    try {
      setLocalProgress((prev) => ({ ...prev, [activeLecture.id]: true }));
      await markLectureComplete(activeLecture.id, course.id);

      // Auto-advance to next lecture
      const currentIdx = allLectures.findIndex((l) => l.id === activeLecture.id);
      const next = allLectures[currentIdx + 1];
      if (next) {
        setActiveLecture(next);
      }
    } finally {
      setMarkingComplete(false);
    }
  }, [activeLecture, course.id, allLectures, markingComplete]);

  const currentIndex = activeLecture
    ? allLectures.findIndex((l) => l.id === activeLecture.id)
    : -1;
  const prevLecture = currentIndex > 0 ? allLectures[currentIndex - 1] : null;
  const nextLecture = currentIndex < allLectures.length - 1 ? allLectures[currentIndex + 1] : null;
  const isCurrentComplete = activeLecture ? (localProgress[activeLecture.id] ?? false) : false;

  return (
    <div className="h-screen flex flex-col bg-gray-950 font-outfit overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 h-14 bg-gray-900 border-b border-gray-800 flex-shrink-0 z-10">
        <Link
          href={`/courses/${course.slug}`}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:block">Back to Course</span>
        </Link>

        <div className="flex-1 min-w-0 text-center hidden md:block">
          <p className="text-white text-sm font-medium truncate">{course.title}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
              {completedCount}/{totalLectures}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all"
          >
            {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Main Video + Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Video / Placeholder */}
          <VideoPlayer lecture={activeLecture} />

          {/* Lecture Info */}
          <div className="px-6 lg:px-10 py-6 bg-gray-900 border-t border-gray-800 space-y-5">
            {activeLecture ? (
              <>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                      {sections.find((s) =>
                        s.lectures?.some((l) => l.id === activeLecture.id)
                      )?.title}
                    </p>
                    <h2 className="text-white text-xl font-semibold mt-1 leading-snug">
                      {activeLecture.title}
                    </h2>
                    {activeLecture.duration_minutes > 0 && (
                      <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
                        <Clock size={13} />
                        {activeLecture.duration_minutes} min
                      </p>
                    )}
                  </div>

                  {/* Mark complete button */}
                  <button
                    onClick={handleMarkComplete}
                    disabled={isCurrentComplete || markingComplete}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0',
                      isCurrentComplete
                        ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800 cursor-default'
                        : 'bg-white text-black hover:bg-gray-100 disabled:opacity-50'
                    )}
                  >
                    {isCurrentComplete ? (
                      <>
                        <CheckCircle2 size={15} />
                        Completed
                      </>
                    ) : (
                      <>
                        <Circle size={15} />
                        Mark Complete
                      </>
                    )}
                  </button>
                </div>

                {activeLecture.description && (
                  <p className="text-gray-400 text-sm leading-relaxed">{activeLecture.description}</p>
                )}

                {/* Prev / Next navigation */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
                  <button
                    onClick={() => prevLecture && setActiveLecture(prevLecture)}
                    disabled={!prevLecture}
                    className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => nextLecture && setActiveLecture(nextLecture)}
                    disabled={!nextLecture}
                    className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <BookOpen size={32} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  {totalLectures === 0
                    ? 'This course has no lectures yet. Check back soon!'
                    : 'Select a lecture from the sidebar to get started.'}
                </p>
              </div>
            )}
          </div>

          {/* Completion Banner */}
          {overallPercent === 100 && (
            <div className="mx-6 lg:mx-10 my-6 p-6 rounded-2xl bg-emerald-900/30 border border-emerald-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <Award size={24} className="text-white" />
              </div>
              <div>
                <p className="text-emerald-300 font-semibold text-base">
                  Course Complete!
                </p>
                <p className="text-emerald-500 text-sm mt-0.5">
                  Congratulations on finishing {course.title}.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — Curriculum */}
        {sidebarOpen && (
          <div className="w-80 xl:w-96 flex-shrink-0 bg-gray-900 border-l border-gray-800 flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 flex-shrink-0">
              <p className="text-white text-sm font-semibold">Course Content</p>
              <p className="text-gray-500 text-xs mt-0.5">
                {completedCount} / {totalLectures} completed &middot; {overallPercent}%
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {sections.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-gray-500 text-sm">No content yet.</p>
                </div>
              ) : (
                sections.map((section) => {
                  const isExpanded = expandedSections.has(section.id);
                  const sectionLectures = section.lectures ?? [];
                  const sectionCompleted = sectionLectures.filter(
                    (l) => localProgress[l.id]
                  ).length;

                  return (
                    <div key={section.id} className="border-b border-gray-800 last:border-b-0">
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-800/50 transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-200 text-sm font-medium leading-snug line-clamp-2">
                            {section.title}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {sectionCompleted}/{sectionLectures.length} &middot;{' '}
                            {sectionLectures.reduce(
                              (acc, l) => acc + (l.duration_minutes || 0),
                              0
                            )}{' '}
                            min
                          </p>
                        </div>
                        <ChevronDown
                          size={15}
                          className={cn(
                            'text-gray-500 flex-shrink-0 ml-2 transition-transform',
                            isExpanded && 'rotate-180'
                          )}
                        />
                      </button>

                      {/* Lectures */}
                      {isExpanded && (
                        <div className="pb-1">
                          {sectionLectures.map((lecture) => {
                            const isActive = activeLecture?.id === lecture.id;
                            const isCompleted = localProgress[lecture.id] ?? false;

                            return (
                              <button
                                key={lecture.id}
                                onClick={() => handleLectureSelect(lecture)}
                                className={cn(
                                  'w-full flex items-start gap-3 px-5 py-3 text-left transition-colors',
                                  isActive
                                    ? 'bg-white/8'
                                    : 'hover:bg-gray-800/40'
                                )}
                              >
                                  {/* Status icon */}
                                  <div className="mt-0.5 flex-shrink-0">
                                    {isCompleted ? (
                                      <CheckCircle2 size={16} className="text-emerald-500" />
                                    ) : isActive ? (
                                      lecture.content_type === 'text'
                                        ? <FileText size={16} className="text-white" />
                                        : <PlayCircle size={16} className="text-white" />
                                    ) : (
                                      <Circle size={16} className="text-gray-600" />
                                    )}
                                  </div>

                                <div className="flex-1 min-w-0">
                                  <p
                                    className={cn(
                                      'text-sm leading-snug line-clamp-2',
                                      isActive
                                        ? 'text-white font-medium'
                                        : isCompleted
                                        ? 'text-gray-400'
                                        : 'text-gray-300'
                                    )}
                                  >
                                    {lecture.title}
                                  </p>
                                  {lecture.duration_minutes > 0 && (
                                    <p className="text-gray-600 text-xs mt-0.5 flex items-center gap-1">
                                      <Clock size={10} />
                                      {lecture.duration_minutes} min
                                    </p>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
