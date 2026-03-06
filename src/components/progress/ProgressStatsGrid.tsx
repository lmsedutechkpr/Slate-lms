import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Clock,
  Award,
  BarChart3,
  Flame,
  Target,
} from 'lucide-react';

interface ProgressStatsGridProps {
  totalEnrolled: number;
  totalCompleted: number;
  totalInProgress: number;
  totalWatchMinutes: number;
  certificateCount: number;
  currentStreak: number;
  longestStreak: number;
  avgQuizScore: number;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  bg: string;
  text: string;
  sub?: string;
}

export function ProgressStatsGrid({
  totalEnrolled,
  totalCompleted,
  totalInProgress,
  totalWatchMinutes,
  certificateCount,
  currentStreak,
  longestStreak,
  avgQuizScore,
}: ProgressStatsGridProps) {
  const hours = Math.floor(totalWatchMinutes / 60);
  const mins = totalWatchMinutes % 60;
  const watchDisplay = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim() : `${mins}m`;

  const cards: StatCard[] = [
    {
      label: 'Enrolled',
      value: totalEnrolled,
      icon: BookOpen,
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
    {
      label: 'Completed',
      value: totalCompleted,
      icon: CheckCircle2,
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
    {
      label: 'In Progress',
      value: totalInProgress,
      icon: TrendingUp,
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
    {
      label: 'Watch Time',
      value: watchDisplay,
      icon: Clock,
      bg: 'bg-violet-50',
      text: 'text-violet-600',
    },
    {
      label: 'Certificates',
      value: certificateCount,
      icon: Award,
      bg: 'bg-rose-50',
      text: 'text-rose-600',
    },
    {
      label: 'Current Streak',
      value: currentStreak,
      icon: Flame,
      bg: 'bg-orange-50',
      text: 'text-orange-500',
      sub: `${longestStreak} day best`,
    },
    {
      label: 'Avg Quiz Score',
      value: avgQuizScore > 0 ? `${Math.round(avgQuizScore)}%` : '—',
      icon: Target,
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
    },
    {
      label: 'Completion Rate',
      value:
        totalEnrolled > 0 ? `${Math.round((totalCompleted / totalEnrolled) * 100)}%` : '—',
      icon: BarChart3,
      bg: 'bg-gray-50',
      text: 'text-gray-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center text-center gap-2"
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bg}`}
          >
            <card.icon size={18} className={card.text} />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 leading-tight">{card.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{card.label}</p>
            {card.sub && (
              <p className="text-[10px] text-gray-300 mt-0.5">{card.sub}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
