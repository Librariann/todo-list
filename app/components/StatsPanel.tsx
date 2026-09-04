'use client';

import { useEffect } from 'react';
import { calculateStreak, getProgressPercentage, getTodayProgress } from '../lib/habitUtils';
import { useUserSummaryStore } from '../store/userSummaryStore';
import { useHabitsStore } from '../store/habitsStore';
import { useGoalsStore } from '../store/goalsStore';
import { useTodosStore } from '../store/todosStore';
import { getTodayDateString } from '../lib/dateUtils';
import { calculatePeriodGoalMetrics, calculateTodayFlowMetrics } from '../lib/taskMetrics';
import { TodoStatus } from '../types/todo';

const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function StatsPanel() {
  const today = new Date();
  const todayString = getTodayDateString();
  const monday = new Date(today);
  const weekday = today.getDay() || 7;
  monday.setDate(today.getDate() - weekday + 1);
  const habits = useHabitsStore((state) => state.habits);
  const habitsLoading = useHabitsStore((state) => state.isLoading);
  const fetchHabits = useHabitsStore((state) => state.fetchHabits);
  const goalsByDate = useGoalsStore((state) => state.goalsByDate);
  const goalsLoading = useGoalsStore((state) => state.loadingByDate[todayString] ?? false);
  const fetchGoals = useGoalsStore((state) => state.fetchGoals);
  const todosByDate = useTodosStore((state) => state.todosByDate);
  const todosLoading = useTodosStore((state) => state.loadingByDate[todayString] ?? false);
  const fetchTodos = useTodosStore((state) => state.fetchTodos);
  const totalPoints = useUserSummaryStore((summary) => summary.points);
  const summaryLoading = useUserSummaryStore((summary) => summary.isLoading);
  const goals = goalsByDate[todayString] ?? [];
  const todos = todosByDate[todayString] ?? [];
  const loading = habitsLoading || goalsLoading || todosLoading || summaryLoading;

  useEffect(() => {
    void Promise.all([fetchHabits(), fetchGoals(todayString), fetchTodos(todayString)]);
  }, [fetchGoals, fetchHabits, fetchTodos, todayString]);

  const week = dayLabels.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateString = toDateString(date);
    const hasHabit = habits.some((habit) => (habit.dailyProgress?.[dateString] ?? 0) > 0);
    const hasGoal = Object.values(goalsByDate).some((dateGoals) =>
      dateGoals.some((goal) => goal.completedDates.includes(dateString))
    );
    const hasTodo = (todosByDate[dateString] ?? []).some((todo) => todo.status === TodoStatus.DONE);

    return {
      label,
      active: hasHabit || hasGoal || hasTodo,
      future: dateString > todayString,
    };
  });

  const longestStreak = Math.max(
    0,
    ...habits.map((habit) => habit.streak ?? calculateStreak(habit)),
    ...goals.map((goal) => goal.streak)
  );
  const { completed: completedCount, total: totalCount } = calculateTodayFlowMetrics(
    habits,
    goals,
    todos
  );
  const periodGoals = calculatePeriodGoalMetrics(goals);

  if (loading) {
    return (
      <div className="space-y-5 py-4">
        <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
        <div className="h-40 animate-pulse rounded-2xl bg-white/10" />
      </div>
    );
  }

  return (
    <div className="text-[#f5f2e9]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[#aeb9b1]">오늘의 요약</p>
        <span className="text-xs text-[#aeb9b1]">습관 {habits.length}</span>
      </div>

      <h2 className="friendly-heading mt-12 text-3xl leading-tight tracking-[-0.04em]">
        매일 두드리는
        <br />
        나의 작은 습관들
      </h2>

      <div className="mt-9 divide-y divide-white/12">
        {habits.length === 0 ? (
          <p className="py-8 text-sm leading-6 text-[#aeb9b1]">
            아직 습관이 없어요.
            <br />
            작은 행동 하나를 만들어보세요.
          </p>
        ) : (
          habits.slice(0, 4).map((habit) => {
            const target = habit.dailyTarget || 5;
            const progress = getTodayProgress(habit);
            const percentage = getProgressPercentage(habit);

            return (
              <div key={habit.id} className="py-5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-semibold">{habit.title}</span>
                  <span className="shrink-0 text-xs tabular-nums text-[#aeb9b1]">
                    {progress} / {target}
                  </span>
                </div>
                <span className="mt-4 block h-1 overflow-hidden rounded-full bg-white/12">
                  <span
                    className="block h-full rounded-full bg-[#79c995] transition-transform"
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </span>
              </div>
            );
          })
        )}
      </div>

      <section className="mt-10 border-t border-white/12 pt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-[#aeb9b1]">오늘의 흐름</p>
            <p className="friendly-heading mt-2 text-3xl font-bold">{completedCount}개 완료</p>
          </div>
          <p className="text-sm font-bold tabular-nums text-[#79c995]">
            {completedCount} / {totalCount}
          </p>
        </div>
        <span
          className="mt-5 block h-2 overflow-hidden rounded-full bg-white/12"
          role="progressbar"
          aria-label="오늘의 할 일 완료율"
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-valuenow={completedCount}
        >
          <span
            className="block h-full origin-left rounded-full bg-[#f2c66d] transition-transform duration-[460ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{
              transform: `scaleX(${totalCount > 0 ? Math.min(1, completedCount / totalCount) : 0})`,
            }}
          />
        </span>
      </section>

      <section className="mt-10 border-t border-white/12 pt-8">
        <div>
          <p className="text-xs text-[#aeb9b1]">기간 목표</p>
          <p className="mt-2 text-xs leading-5 text-[#8f9b93]">
            주간·월간 목표는 오늘의 흐름과 별도로 집계해요.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          {(
            [
              { label: '이번 주', metrics: periodGoals.weekly, color: 'bg-[#79c995]' },
              { label: '이번 달', metrics: periodGoals.monthly, color: 'bg-[#8ebdcd]' },
            ] as const
          ).map(({ label, metrics, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{label}</span>
                <span className="tabular-nums text-[#aeb9b1]">
                  {metrics.completed} / {metrics.total}
                </span>
              </div>
              <span
                className="mt-3 block h-1.5 overflow-hidden rounded-full bg-white/12"
                role="progressbar"
                aria-label={`${label} 목표 완료율`}
                aria-valuemin={0}
                aria-valuemax={metrics.total}
                aria-valuenow={metrics.completed}
              >
                <span
                  className={`block h-full origin-left rounded-full ${color} transition-transform duration-[460ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none`}
                  style={{
                    transform: `scaleX(${metrics.total > 0 ? Math.min(1, metrics.completed / metrics.total) : 0})`,
                  }}
                />
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 border-t border-white/12 pt-8">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#aeb9b1]">이번 주의 리듬</p>
          <p className="text-sm font-semibold">{longestStreak}일째</p>
        </div>
        <div className="mt-6 grid grid-cols-7 gap-2">
          {week.map((day) => (
            <div key={day.label} className="text-center">
              <span className="block text-[0.65rem] text-[#aeb9b1]">{day.label}</span>
              <span
                className={`mx-auto mt-2 block h-8 w-1.5 rounded-full ${
                  day.active ? 'bg-[#79c995]' : 'bg-white/14'
                } ${day.future ? 'opacity-45' : ''}`}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 flex items-end justify-between border-t border-white/12 pt-8">
        <div>
          <p className="text-xs text-[#aeb9b1]">모아둔 포인트</p>
          <p className="friendly-heading mt-2 text-3xl font-bold tabular-nums">{totalPoints} P</p>
        </div>
      </section>
    </div>
  );
}
