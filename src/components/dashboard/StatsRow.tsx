'use client';

import { BookOpen, CheckCircle2, Clock, Trophy, BarChart2 } from 'lucide-react';
import { DashboardStats } from '@/types';

interface StatsRowProps {
  stats: DashboardStats;
}

const statCards = (stats: DashboardStats) => [
  {
    label: 'Enrolled',
    value: stats.enrolled,
    icon: BookOpen,
  },
  {
    label: 'In Progress',
    value: stats.inProgress,
    icon: BarChart2,
  },
  {
    label: 'Completed',
    value: stats.completed,
    icon: CheckCircle2,
  },
  {
    label: 'Hours Learned',
    value: stats.hoursLearned,
    unit: 'h',
    icon: Clock,
  },
  {
    label: 'Certificates',
    value: stats.certificates,
    icon: Trophy,
  },
];

export function StatsRow({ stats }: StatsRowProps) {
  const cards = statCards(stats);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="p-5 rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition-all duration-150"
        >
          <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center mb-3">
            <card.icon size={18} className="text-black" />
          </div>
          <p className="text-2xl font-semibold tracking-tight text-gray-900">
            {card.value}
            {card.unit}
          </p>
          <p className="text-[11px] font-normal uppercase tracking-wider text-gray-400 mt-0.5">
            {card.label}
          </p>
        </div>
      ))}
    </div>
  );
}
