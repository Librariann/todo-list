'use client';

import { Habit, Goal } from '../types/todo';
import { ProgressMetrics } from '../lib/rewardUtils';
import { calculateStreak, getProgressPercentage, getTodayProgress } from '../lib/habitUtils';

export interface RewardItem {
  id: number;
  name: string;
  type: 'COUPON' | 'POINT';
  point: number;
  description: string;
  discount?: boolean;
  discountRate?: number;
  used?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeItem {
  id: number;
  name: string;
  description: string;
  icon: string;
  recurrenceType: string;
  targetCount: number;
  point: number;
  isActive: boolean;
  currentCount?: number;
  achieved?: boolean;
  periodType?: string;
  periodKey?: string;
  achievedAt?: string;
}

interface StatsPanelProps {
  totalPoints: number;
  habits: Habit[];
  goals: Goal[];
  completedTodoDates: ReadonlySet<string>;
  metrics: ProgressMetrics;
  loading: boolean;
}

const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function StatsPanel({
  totalPoints,
  habits,
  goals,
  completedTodoDates,
  metrics,
  loading,
}: StatsPanelProps) {
  const today = new Date();
  const monday = new Date(today);
  const weekday = today.getDay() || 7;
  monday.setDate(today.getDate() - weekday + 1);

  const week = dayLabels.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateString = toDateString(date);
    const hasHabit = habits.some((habit) => (habit.dailyProgress?.[dateString] ?? 0) > 0);
    const hasGoal = goals.some((goal) => goal.completedDates.includes(dateString));

    return {
      label,
      active: hasHabit || hasGoal || completedTodoDates.has(dateString),
      future: date > today,
    };
  });

  const longestStreak = Math.max(
    0,
    ...habits.map((habit) => habit.streak ?? calculateStreak(habit)),
    ...goals.map((goal) => goal.streak)
  );
  const completedCount =
    metrics.habitsCompletedToday + metrics.goalsCompletedToday + metrics.todosCompletedToday;
  const totalCount = metrics.totalHabitsToday + metrics.totalGoalsToday + metrics.totalTodosToday;

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
        <p className="text-xs font-bold tracking-[0.18em] text-[#aeb9b1]">SIDE ROOM</p>
        <span className="text-xs text-[#aeb9b1]">습관 {habits.length}</span>
      </div>

      <h2 className="friendly-heading mt-12 text-3xl leading-tight tracking-[-0.04em]">
        매일 두드리는<br />작은 문들
      </h2>

      <div className="mt-9 divide-y divide-white/12">
        {habits.length === 0 ? (
          <p className="py-8 text-sm leading-6 text-[#aeb9b1]">
            아직 습관이 없어요.<br />작은 행동 하나를 만들어보세요.
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
          <p className="text-sm font-bold tabular-nums text-[#79c995]">{completedCount} / {totalCount}</p>
        </div>
        <span className="mt-5 block h-2 overflow-hidden rounded-full bg-white/12">
          <span
            className="block h-full rounded-full bg-[#f2c66d]"
            style={{ width: `${totalCount > 0 ? Math.min(100, (completedCount / totalCount) * 100) : 0}%` }}
          />
        </span>
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
          <p className="friendly-heading mt-2 text-3xl font-bold tabular-nums">
            {totalPoints.toLocaleString()} P
          </p>
        </div>
        <span className="text-xs font-bold text-[#f2c66d]">오늘 +{metrics.totalPointsEarned}</span>
      </section>
    </div>
  );
}
