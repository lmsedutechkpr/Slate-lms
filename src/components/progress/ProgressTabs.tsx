'use client';

import { useState } from 'react';
import { BarChart3, Target, Award } from 'lucide-react';
import { Enrollment, Certificate, QuizAttempt } from '@/types';
import { CourseProgressList } from './CourseProgressList';
import { QuizHistoryTable } from './QuizHistoryTable';
import { CertificatesList } from './CertificatesList';

interface CourseProgressItem {
  enrollment: Enrollment;
  completedLectures: number;
  totalLectures: number;
  quizAttempts: QuizAttempt[];
  certificate: Certificate | null;
}

interface QuizHistoryRow {
  attempt: QuizAttempt;
  courseName: string | null;
  quizTitle: string | null;
}

interface CertRow {
  certificate: Certificate;
  course: any | null;
}

type TabKey = 'courses' | 'quizzes' | 'certificates';

interface ProgressTabsProps {
  courseProgress: CourseProgressItem[];
  quizHistory: QuizHistoryRow[];
  certificates: CertRow[];
  lang?: 'en' | 'ta';
}

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'courses', label: 'Courses', icon: BarChart3 },
  { key: 'quizzes', label: 'Quizzes', icon: Target },
  { key: 'certificates', label: 'Certificates', icon: Award },
];

export function ProgressTabs({
  courseProgress,
  quizHistory,
  certificates,
  lang = 'en',
}: ProgressTabsProps) {
  const [active, setActive] = useState<TabKey>('courses');

  const counts: Record<TabKey, number> = {
    courses: courseProgress.length,
    quizzes: quizHistory.length,
    certificates: certificates.length,
  };

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              active === tab.key
                ? 'bg-black text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
            {counts[tab.key] > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  active === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {active === 'courses' && (
        <CourseProgressList items={courseProgress} lang={lang} />
      )}
      {active === 'quizzes' && <QuizHistoryTable rows={quizHistory} />}
      {active === 'certificates' && (
        <CertificatesList rows={certificates} lang={lang} />
      )}
    </div>
  );
}
