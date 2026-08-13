'use client';

import { Habit, Goal } from '../types/todo';
import { ProgressMetrics } from '../lib/rewardUtils';
import { calculateStreak } from '../lib/habitUtils';

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
const activeDotColors = [
  'bg-primary',
  'bg-primary',
  'bg-primary',
  'bg-[oklch(0.82_0.16_82)]',
  'bg-[oklch(0.72_0.13_238)]',
  'bg-[oklch(0.75_0.1_310)]',
  'bg-[oklch(0.76_0.13_55)]',
];

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
  const pathLength = Math.max(5, Math.min(7, totalCount || 5));

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        <div className="h-36 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div>
      <section>
        <h2 className="friendly-heading text-2xl font-bold">이번 주 습관</h2>
        <div className="mt-7 grid grid-cols-7 gap-2">
          {week.map((day, index) => (
            <div key={day.label} className="text-center">
              <span className="text-sm font-medium text-muted-foreground">{day.label}</span>
              <span
                className={`mx-auto mt-3 block h-8 w-8 rounded-full transition-colors ${
                  day.active ? activeDotColors[index] : 'bg-muted'
                } ${day.future ? 'opacity-55' : ''}`}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-[1.4rem] bg-secondary/65 px-6 py-6">
        <p className="text-sm font-medium text-secondary-foreground">이번 주도 잘 이어가고 있어요</p>
        <p className="friendly-heading mt-2 text-4xl font-bold text-primary">
          {longestStreak}일 연속
        </p>
      </section>

      <section className="mt-8 border-t border-border pt-7">
        <p className="text-base text-muted-foreground">
          오늘 <strong className="text-2xl text-primary">{completedCount}개</strong> 완료
        </p>
        <div className="mt-6 flex items-center">
          {Array.from({ length: pathLength }).map((_, index) => {
            const complete = index < completedCount;
            return (
              <div key={index} className="flex flex-1 items-center last:flex-none">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                    complete
                      ? `${activeDotColors[index]} border-transparent text-white`
                      : 'border-border bg-card text-muted-foreground'
                  }`}
                >
                  {complete ? '✓' : index + 1}
                </span>
                {index < pathLength - 1 && (
                  <span className={`h-0.5 flex-1 ${index < completedCount - 1 ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {completedCount > 0 ? '좋아요. 이 흐름 그대로 이어가요.' : '첫 번째 완료부터 가볍게 시작해요.'}
        </p>
      </section>

      <section className="mt-8 flex items-end justify-between border-t border-border pt-7">
        <div>
          <p className="text-sm font-medium text-muted-foreground">내 포인트</p>
          <p className="friendly-heading mt-1 text-4xl font-bold tabular-nums">
            {totalPoints.toLocaleString()} P
          </p>
        </div>
        <span className="rounded-full bg-[oklch(0.94_0.08_78)] px-4 py-2 text-sm font-bold text-[oklch(0.54_0.13_58)] dark:bg-muted dark:text-accent">
          오늘 +{metrics.totalPointsEarned}
        </span>
      </section>
    </div>
  );
}
