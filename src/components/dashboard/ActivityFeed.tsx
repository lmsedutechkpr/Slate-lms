import {
  PlusCircle,
  CheckCircle2,
  Heart,
  Zap,
  Star,
  BookOpen,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { UserActivityLog, ActivityType } from '@/types';

interface ActivityFeedProps {
  activities: UserActivityLog[];
}

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: React.ElementType; label: (a: UserActivityLog) => string }
> = {
  enrollment: {
    icon: PlusCircle,
    label: (a) => `Enrolled in ${a.course?.title ?? 'a course'}`,
  },
  lecture_complete: {
    icon: CheckCircle2,
    label: (a) =>
      a.lecture?.title
        ? `Completed "${a.lecture.title}"`
        : `Completed a lecture in ${a.course?.title ?? 'a course'}`,
  },
  course_complete: {
    icon: BookOpen,
    label: (a) => `Finished ${a.course?.title ?? 'a course'}`,
  },
  wishlist_add: {
    icon: Heart,
    label: (a) => `Added ${a.course?.title ?? 'a course'} to wishlist`,
  },
  course_review: {
    icon: Star,
    label: (a) => `Reviewed ${a.course?.title ?? 'a course'}`,
  },
  purchase: {
    icon: ShoppingBag,
    label: (a) => `Purchased ${a.course?.title ?? 'an item'}`,
  },
  quiz_attempt: {
    icon: Zap,
    label: (a) => `Attempted a quiz in ${a.course?.title ?? 'a course'}`,
  },
  certificate_earned: {
    icon: CheckCircle2,
    label: (a) => `Earned certificate for ${a.course?.title ?? 'a course'}`,
  },
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-5">
        <h2 className="text-lg font-medium tracking-tight text-gray-900">Recent Activity</h2>

      {activities.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white border border-gray-200 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Zap size={20} className="text-gray-300" />
          </div>
          <div>
            <p className="text-gray-900 font-medium text-sm">No activity yet</p>
              <p className="text-gray-400 text-sm font-normal mt-0.5">
              Start learning to see your journey here.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          {activities.map((activity, index) => {
            const config = ACTIVITY_CONFIG[activity.activity_type];
            if (!config) return null;
            return (
              <div
                key={activity.id}
                className={cn(
                  'flex items-start gap-3.5 px-5 py-4 hover:bg-gray-50 transition-colors',
                  index !== activities.length - 1 && 'border-b border-gray-100'
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <config.icon size={15} className="text-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-normal text-gray-600 leading-snug line-clamp-2">
                    {config.label(activity)}
                  </p>
                  <span className="text-xs font-normal text-gray-400 mt-0.5 block">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
