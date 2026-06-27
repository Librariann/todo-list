import Calendar from '@/app/components/Calendar';
import { useCalendarStore } from '@/app/store/calendarStore';
import type { TaskTabType } from '@/app/types/navigation';

interface TaskInsightsProps {
  activeTab: TaskTabType;
  completedToday: number;
  totalToday: number;
  userPoints: number;
  // progressMetrics: ProgressMetrics;
  selectedDate: string;
  // markedDates: string[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export default function TaskInsights({
  activeTab,
  completedToday,
  totalToday,
  userPoints,
  // progressMetrics,
  selectedDate,
  // markedDates,
  currentMonth,
  onMonthChange,
}: TaskInsightsProps) {
  const showsCalendar = activeTab === 'goals' || activeTab === 'todos';
  const setSelectedDate = useCalendarStore((calendar) => calendar.setSelectedDate);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
      <section className="rounded-[1.75rem] bg-[#f4d89e] p-6 text-[#3f3625] dark:bg-[oklch(0.45_0.08_75)] dark:text-foreground">
        <p className="text-xs font-bold tracking-[0.16em] text-[#765f31] dark:text-foreground/70">
          SUNNY CORNER
        </p>
        <p className="friendly-heading mt-8 text-4xl font-bold tracking-[-0.06em]">
          {completedToday}개 완료
        </p>
        <p className="mt-2 text-sm leading-6 text-[#6d5b37] dark:text-foreground/75">
          {completedToday > 0
            ? `오늘의 ${totalToday || completedToday}개 중 여기까지 잘 왔어요.`
            : '첫 번째 일을 끝내면 오늘의 흐름이 시작돼요.'}
        </p>
      </section>

      <section className="rounded-[1.75rem] bg-[#cfe6ed] p-6 text-[#294850] dark:bg-[oklch(0.4_0.055_225)] dark:text-foreground">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold tracking-[0.16em] text-[#3f6873] dark:text-foreground/70">
            WINDOW VIEW
          </p>
          <span className="text-xs font-semibold">{userPoints.toLocaleString()} P</span>
        </div>
        {showsCalendar ? (
          <div className="mt-5 rounded-2xl bg-[#fbf8ef]/80 p-2 text-[#26302a] dark:bg-card dark:text-foreground">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              // markedDates={markedDates}
              currentMonth={currentMonth}
              onMonthChange={onMonthChange}
            />
          </div>
        ) : (
          <div className="mt-8">
            <p className="friendly-heading text-3xl font-bold">
              {/* 오늘 +{progressMetrics.totalPointsEarned} */}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#4f6c73] dark:text-foreground/75">
              완료할 때마다 내일 다시 돌아올 이유가 쌓여요.
            </p>
          </div>
        )}
      </section>
    </aside>
  );
}
