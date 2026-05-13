import { Habit } from '@/app/types/todo';

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

export function getTodayProgress(habit: Habit): number {
  const today = getTodayDateString();
  return habit.dailyProgress?.[today] || 0;
}

export function getProgressPercentage(habit: Habit): number {
  const todayProgress = getTodayProgress(habit);
  const target = habit.dailyTarget || 5;
  return Math.min((todayProgress / target) * 100, 100);
}

export function isCompletedToday(habit: Habit): boolean {
  const todayProgress = getTodayProgress(habit);
  const target = habit.dailyTarget || 5;
  return todayProgress >= target;
}

export function calculateStreak(habit: Habit): number {
  // API에서 제공한 스트리크가 있으면 우선 사용
  if (habit.streak !== undefined) return habit.streak;

  if (!habit.dailyProgress || !habit.dailyTarget) return 0;

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    const dayProgress = habit.dailyProgress[dateStr] || 0;

    if (dayProgress >= habit.dailyTarget) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function getProgressMessage(habit: Habit): string {
  const percentage = getProgressPercentage(habit);
  const isCompleted = isCompletedToday(habit);

  if (isCompleted) return '오늘 목표 달성 완료!';
  if (percentage >= 80) return '거의 다 왔어요!';
  if (percentage >= 50) return '좋은 페이스!';
  if (percentage > 0) return '시작이 좋아요!';
  return '시작해보세요!';
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return 'text-emerald-600';
  if (percentage >= 60) return 'text-blue-600';
  return 'text-gray-600';
}

export function canIncrementProgress(habit: Habit): boolean {
  const todayProgress = getTodayProgress(habit);
  const target = habit.dailyTarget || 5;
  return todayProgress < target;
}

export function canDecrementProgress(habit: Habit): boolean {
  const todayProgress = getTodayProgress(habit);
  return todayProgress > 0;
}

export function updateHabitProgress(habit: Habit, increment: number): Habit {
  const today = getTodayDateString();
  const currentProgress = getTodayProgress(habit);
  const target = habit.dailyTarget || 5;

  const newProgress = Math.max(0, Math.min(target, currentProgress + increment));

  const updatedDailyProgress = {
    ...habit.dailyProgress,
    [today]: newProgress,
  };

  return {
    ...habit,
    dailyProgress: updatedDailyProgress,
    lastUpdatedDate: today,
    positiveCount: increment > 0 ? habit.positiveCount + 1 : habit.positiveCount,
    negativeCount: increment < 0 ? habit.negativeCount + 1 : habit.negativeCount,
  };
}
