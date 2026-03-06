'use client';

interface WeeklyDay {
  date: string;
  lecturesCompleted: number;
  minutesWatched: number;
}

interface WeeklyActivityChartProps {
  data: WeeklyDay[];
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  const maxLectures = Math.max(...data.map((d) => d.lecturesCompleted), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">7-Day Activity</h3>
      <p className="text-xs text-gray-400 mb-5">Lectures completed per day</p>

      <div className="flex items-end gap-2 h-28">
        {data.map((day) => {
          const date = new Date(day.date + 'T00:00:00Z');
          const label = DAY_LABELS[date.getUTCDay()];
          const heightPct = (day.lecturesCompleted / maxLectures) * 100;
          const isToday =
            day.date ===
            new Date().toISOString().split('T')[0];

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
              {/* Bar */}
              <div className="w-full flex flex-col-reverse" style={{ height: '80px' }}>
                <div
                  className={`w-full rounded-t-md transition-all ${
                    day.lecturesCompleted > 0
                      ? isToday
                        ? 'bg-black'
                        : 'bg-gray-800'
                      : 'bg-gray-100'
                  }`}
                  style={{
                    height: `${Math.max(heightPct, day.lecturesCompleted > 0 ? 8 : 4)}%`,
                  }}
                  title={`${day.lecturesCompleted} lecture${day.lecturesCompleted !== 1 ? 's' : ''}, ${day.minutesWatched}m watched`}
                />
              </div>
              {/* Count */}
              <span className="text-[10px] text-gray-400">
                {day.lecturesCompleted > 0 ? day.lecturesCompleted : ''}
              </span>
              {/* Day label */}
              <span
                className={`text-[10px] font-medium ${
                  isToday ? 'text-black' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-base font-bold text-gray-900">
            {data.reduce((a, b) => a + b.lecturesCompleted, 0)}
          </p>
          <p className="text-[11px] text-gray-400">Lectures this week</p>
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">
            {Math.round(data.reduce((a, b) => a + b.minutesWatched, 0) / 60 * 10) / 10}h
          </p>
          <p className="text-[11px] text-gray-400">Hours watched</p>
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">
            {data.filter((d) => d.lecturesCompleted > 0).length}
          </p>
          <p className="text-[11px] text-gray-400">Active days</p>
        </div>
      </div>
    </div>
  );
}
