import { cn } from '@/lib/utils';

interface DifficultyBadgeProps {
  difficulty: string;
  className?: string;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner:     'bg-emerald-100 text-emerald-700 border-emerald-200',
  intermediate: 'bg-amber-100 text-amber-700 border-amber-200',
  advanced:     'bg-rose-100 text-rose-700 border-rose-200',
};

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const normalizedDifficulty = (difficulty ?? '').toLowerCase();
  const styles = DIFFICULTY_STYLES[normalizedDifficulty] || 'bg-gray-100 text-gray-700 border-gray-200';
  
  return (
    <span className={cn(
      "text-[10px] font-semibold rounded-full px-2 py-0.5 border capitalize",
      styles,
      className
    )}>
      {difficulty || 'All Levels'}
    </span>
  );
}
