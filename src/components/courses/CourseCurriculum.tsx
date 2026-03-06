'use client';

import { useState } from 'react';
import { CourseSection } from '@/types';
import { PlayCircle, Lock, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseCurriculumProps {
  sections: CourseSection[];
  isEnrolled: boolean;
}

export function CourseCurriculum({ sections, isEnrolled }: CourseCurriculumProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(sections.slice(0, 1).map((s) => s.id))
  );
  const [showAll, setShowAll] = useState(false);

  const toggle = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!sections || sections.length === 0) {
    return (
      <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center">
        <p className="text-gray-400 text-sm">Curriculum coming soon</p>
      </div>
    );
  }

  const totalLectures = sections.reduce((a, s) => a + (s.lectures?.length ?? 0), 0);
  const totalMinutes = sections.reduce(
    (a, s) => a + (s.lectures?.reduce((la, l) => la + l.duration_minutes, 0) ?? 0),
    0
  );
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;

  const visibleSections = showAll ? sections : sections.slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Course Curriculum</h2>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{sections.length} sections</span>
          <span>·</span>
          <span>{totalLectures} lectures</span>
          <span>·</span>
          <span>
            {totalHours > 0 ? `${totalHours}h ` : ''}
            {remainingMins > 0 ? `${remainingMins}m` : ''}
          </span>
        </div>
      </div>

      {/* Sections */}
      <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
        {visibleSections.map((section, idx) => {
          const isOpen = openSections.has(section.id);
          const sectionMins = section.lectures?.reduce((a, l) => a + l.duration_minutes, 0) ?? 0;

          return (
            <div key={section.id}>
              {/* Section Header */}
              <button
                onClick={() => toggle(section.id)}
                className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-600 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{section.title}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {section.lectures?.length ?? 0} lectures · {sectionMins}m
                  </span>
                  {isOpen ? (
                    <ChevronUp size={15} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={15} className="text-gray-400" />
                  )}
                </div>
              </button>

              {/* Lectures */}
              {isOpen && section.lectures && section.lectures.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {section.lectures.map((lecture) => {
                    const locked = !isEnrolled && !lecture.is_free_preview;
                    return (
                      <div
                        key={lecture.id}
                        className={cn(
                          'flex items-center justify-between px-5 py-3 bg-white',
                          locked ? 'opacity-60' : 'hover:bg-gray-50'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                              locked ? 'bg-gray-100' : 'bg-gray-100'
                            )}
                          >
                            {locked ? (
                              <Lock size={12} className="text-gray-400" />
                            ) : (
                              <PlayCircle size={14} className="text-gray-600" />
                            )}
                          </div>
                          <span className="text-sm text-gray-700 truncate">{lecture.title}</span>
                          {lecture.is_free_preview && !isEnrolled && (
                            <span className="flex-shrink-0 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                              Preview
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 ml-4 flex-shrink-0">
                          <Clock size={11} />
                          <span>{lecture.duration_minutes}m</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sections.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm font-medium text-gray-600 hover:text-gray-900 underline underline-offset-2 transition-colors"
        >
          {showAll ? 'Show less' : `Show ${sections.length - 5} more sections`}
        </button>
      )}
    </div>
  );
}
