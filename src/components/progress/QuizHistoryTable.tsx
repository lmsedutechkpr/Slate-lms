import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { QuizAttempt } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface QuizHistoryRow {
  attempt: QuizAttempt;
  courseName: string | null;
  quizTitle: string | null;
}

interface QuizHistoryTableProps {
  rows: QuizHistoryRow[];
}

export function QuizHistoryTable({ rows }: QuizHistoryTableProps) {
  if (rows.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <p className="text-gray-400 text-sm">No quiz attempts yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Quiz
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Course
            </th>
            <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Score
            </th>
            <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Result
            </th>
            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(({ attempt, courseName, quizTitle }) => (
            <tr key={attempt.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3 text-gray-900 font-medium">
                {quizTitle ?? 'Quiz'}
              </td>
              <td className="px-5 py-3 text-gray-500 text-xs">
                {attempt.course?.slug ? (
                  <Link
                    href={`/courses/${attempt.course.slug}`}
                    className="hover:text-gray-800 transition-colors"
                  >
                    {courseName ?? '—'}
                  </Link>
                ) : (
                  courseName ?? '—'
                )}
              </td>
              <td className="px-5 py-3 text-center">
                <span className="font-semibold text-gray-900">
                  {Math.round(attempt.percentage)}%
                </span>
                <span className="text-gray-400 text-xs ml-1">
                  ({attempt.score}/{attempt.max_score})
                </span>
              </td>
              <td className="px-5 py-3 text-center">
                {attempt.passed ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                    <CheckCircle2 size={12} />
                    Passed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-500 text-xs font-semibold">
                    <XCircle size={12} />
                    Failed
                  </span>
                )}
              </td>
              <td className="px-5 py-3 text-right text-xs text-gray-400">
                {attempt.completed_at ? (
                  <span className="flex items-center justify-end gap-1">
                    <Clock size={11} />
                    {formatDistanceToNow(new Date(attempt.completed_at), { addSuffix: true })}
                  </span>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
