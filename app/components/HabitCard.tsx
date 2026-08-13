'use client';

import { Habit } from '../types/todo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  getTodayProgress,
  getProgressPercentage,
  isCompletedToday,
  calculateStreak,
  getProgressMessage,
  getProgressColor,
  canIncrementProgress,
  canDecrementProgress,
} from '../lib/habitUtils';

interface HabitCardProps {
  habit: Habit;
  onPositive: (id: string) => void;
  onNegative: (id: string) => void;
}

export default function HabitCard({ habit, onPositive, onNegative }: HabitCardProps) {
  const dailyTarget = habit.dailyTarget || 5;
  const todayProgress = getTodayProgress(habit);
  const progressPercentage = getProgressPercentage(habit);
  const streakDays = calculateStreak(habit);
  const completed = isCompletedToday(habit);
  const canIncrement = canIncrementProgress(habit);
  const canDecrement = canDecrementProgress(habit);

  return (
    <article className={`companion-entry group relative ${completed ? 'border-primary/25 bg-secondary/55' : ''}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <span className="text-lg">{getHabitIcon()}</span> */}
            <div>
              <h3 className="font-medium text-foreground">{habit.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="rounded-full border-0 text-xs">
                  하루 {dailyTarget}회 목표
                </Badge>
                {streakDays > 0 && (
                  <Badge variant="outline" className="rounded-full text-xs text-orange-600">
                    {streakDays}일 연속
                  </Badge>
                )}
                {completed && <Badge className="rounded-full bg-primary text-xs text-white">완료</Badge>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${getProgressColor(progressPercentage)}`}>
              {todayProgress}/{dailyTarget}
            </div>
            <div className="text-xs text-muted-foreground">{Math.round(progressPercentage)}%</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">오늘의 진행도</span>
            <span className="text-sm font-medium">{getProgressMessage(habit)}</span>
          </div>
          <Progress value={progressPercentage} className="h-2.5" glow />
        </div>

        {completed ? (
          <div className="flex items-center justify-center py-3 text-center">
            <span className="friendly-heading px-2 text-sm font-bold text-primary">
              오늘도 해냈어요. 이 흐름 그대로 이어가요!
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 sm:gap-2">
            <Button
              onClick={() => onNegative(habit.id)}
              variant="outline"
              size="sm"
              className="h-11 max-w-20 flex-1 touch-manipulation rounded-xl"
              disabled={!canDecrement}
              aria-label={`${habit.title} 진행 횟수 줄이기`}
            >
              <Minus className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>

            <div className="flex min-w-[80px] items-center justify-center px-3 sm:px-4">
              <span className="text-sm font-medium text-center">{todayProgress}회</span>
            </div>

            <Button
              onClick={() => onPositive(habit.id)}
              variant="outline"
              size="sm"
              className="h-11 max-w-20 flex-1 touch-manipulation rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!canIncrement}
              aria-label={`${habit.title} 진행 횟수 늘리기`}
            >
              <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
