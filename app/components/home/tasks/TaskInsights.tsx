import { useEffect, useMemo, useState } from 'react';
import Calendar from '@/app/components/Calendar';
import { fetchGoalMarkedDates } from '@/app/lib/goalsApi';
import { getTodayDateString } from '@/app/lib/dateUtils';
import { calculateTodayFlowMetrics } from '@/app/lib/taskMetrics';
import { fetchTodoMarkedDates } from '@/app/lib/todosApi';
import { useAuthStore } from '@/app/store/authStore';
import { useCalendarStore } from '@/app/store/calendarStore';
import { useGoalsStore } from '@/app/store/goalsStore';
import { useHabitsStore } from '@/app/store/habitsStore';
import { useTodosStore } from '@/app/store/todosStore';
import type { TaskTabType } from '@/app/types/navigation';

interface TaskInsightsProps {
  activeTab: TaskTabType;
}

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function TaskInsights({ activeTab }: TaskInsightsProps) {
  const showsCalendar = activeTab === 'goals' || activeTab === 'todos';
  const today = getTodayDateString();
  const habits = useHabitsStore((state) => state.habits);
  const goalsByDate = useGoalsStore((state) => state.goalsByDate);
  const todosByDate = useTodosStore((state) => state.todosByDate);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const selectedDate = useCalendarStore((calendar) => calendar.selectedDate);
  const currentMonth = useCalendarStore((calendar) => calendar.currentMonth);
  const marksVersion = useCalendarStore((calendar) => calendar.marksVersion);
  const setSelectedDate = useCalendarStore((calendar) => calendar.setSelectedDate);
  const onMonthChange = useCalendarStore((calendar) => calendar.setCurrentMonth);
  const [remoteTodoDates, setRemoteTodoDates] = useState<ReadonlySet<string>>(new Set());
  const [remoteGoalDates, setRemoteGoalDates] = useState<ReadonlySet<string>>(new Set());
  const goals = goalsByDate[today] ?? [];
  const todos = todosByDate[today] ?? [];
  const { completed: completedToday, total: totalToday } = calculateTodayFlowMetrics(
    habits,
    goals,
    todos
  );

  const monthRange = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();
    return {
      prefix: `${year}-${String(month).padStart(2, '0')}`,
      from: toDateString(year, month, 1),
      to: toDateString(year, month, lastDay),
    };
  }, [currentMonth]);

  useEffect(() => {
    if (!isAuthenticated || !showsCalendar) return;

    let active = true;
    const controller = new AbortController();

    const datesRequest =
      activeTab === 'todos'
        ? fetchTodoMarkedDates(monthRange.from, monthRange.to, controller.signal)
        : fetchGoalMarkedDates(monthRange.from, monthRange.to, controller.signal);

    datesRequest
      .then((dates) => {
        if (!active) return;
        if (activeTab === 'todos') setRemoteTodoDates(new Set(dates));
        else setRemoteGoalDates(new Set(dates));
      })
      .catch(() => {
        if (!active) return;
        if (activeTab === 'todos') setRemoteTodoDates(new Set());
        else setRemoteGoalDates(new Set());
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [activeTab, isAuthenticated, marksVersion, monthRange, showsCalendar]);

  const markedDates = useMemo(() => {
    if (activeTab === 'goals') return remoteGoalDates;

    const todoDates = new Set(remoteTodoDates);

    Object.entries(todosByDate).forEach(([date, items]) => {
      if (!date.startsWith(monthRange.prefix)) return;
      if (items.length > 0) todoDates.add(date);
      else todoDates.delete(date);
    });

    return todoDates;
  }, [activeTab, monthRange.prefix, remoteGoalDates, remoteTodoDates, todosByDate]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <aside className={`grid min-w-0 gap-4 ${showsCalendar ? '@min-[36rem]/insights:grid-cols-2' : ''}`}>
      {showsCalendar ? (
        <section className="min-w-0 rounded-[1.75rem] bg-[#cfe6ed] p-3 text-[#294850] dark:bg-[oklch(0.4_0.055_225)] dark:text-foreground">
          <p className="text-xs font-bold text-[#3f6873] dark:text-foreground/70">날짜별 기록</p>
          <div className="mt-4 rounded-2xl bg-[#fbf8ef]/80 p-1.5 text-[#26302a] dark:bg-card dark:text-foreground">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              markedDates={markedDates}
              currentMonth={currentMonth}
              onMonthChange={onMonthChange}
            />
          </div>
        </section>
      ) : null}

      <section className="rounded-[1.75rem] bg-[#f4d89e] p-6 text-[#3f3625] dark:bg-[oklch(0.45_0.08_75)] dark:text-foreground">
        <p className="text-xs font-bold text-[#765f31] dark:text-foreground/70">오늘 한눈에</p>
        <p className="friendly-heading mt-8 text-4xl font-bold tracking-[-0.06em]">
          {completedToday}개 완료
        </p>
        <p className="mt-2 text-sm leading-6 text-[#6d5b37] dark:text-foreground/75">
          {completedToday > 0
            ? `오늘의 ${totalToday || completedToday}개 중 여기까지 잘 왔어요.`
            : '첫 번째 일을 끝내면 오늘의 흐름이 시작돼요.'}
        </p>
      </section>
    </aside>
  );
}
