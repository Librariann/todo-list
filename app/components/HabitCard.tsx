'use client';

import { Habit } from '../types/todo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  getTodayProgress,
  getProgressPercentage,
  isCompletedToday,
  calculateStreak,
  getProgressMessage,
  canIncrementProgress,
  canDecrementProgress,
} from '../lib/habitUtils';

interface HabitCardProps {
  habit: Habit;
  onPositive: (id: string) => void;
  onNegative: (id: string) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habit: Habit) => void;
}

export default function HabitCard({
  habit,
  onPositive,
  onNegative,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const dailyTarget = habit.dailyTarget || 5;
  const todayProgress = getTodayProgress(habit);
  const progressPercentage = getProgressPercentage(habit);
  const streakDays = calculateStreak(habit);
  const completed = isCompletedToday(habit);
  const canIncrement = canIncrementProgress(habit);
  const canDecrement = canDecrementProgress(habit);

  return (
    <article
      className={`companion-entry group relative w-full min-w-0 max-w-full overflow-hidden px-3.5 py-4 sm:px-4 ${completed ? 'border-primary/25 bg-secondary/55' : ''}`}
    >
      <div className="min-w-0 space-y-4">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:gap-4">
          <div className="min-w-0 pt-0.5">
            <h3 className="friendly-heading break-words text-base font-bold leading-6 text-foreground [overflow-wrap:anywhere] sm:text-lg">
              {habit.title}
            </h3>
            <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="rounded-full border-0 px-2.5 py-1 text-xs">
                하루 {dailyTarget}회 목표
              </Badge>
              {streakDays > 0 && (
                <Badge
                  variant="outline"
                  className="rounded-full border-orange-200 bg-orange-50 px-2.5 py-1 text-xs text-orange-700 dark:border-orange-800/40 dark:bg-orange-900/15 dark:text-orange-300"
                >
                  {streakDays}일 연속
                </Badge>
              )}
              {completed && (
                <Badge className="rounded-full bg-primary px-2.5 py-1 text-xs text-primary-foreground">
                  오늘 완료
                </Badge>
              )}
            </div>
          </div>
          <div className="-mr-2 -mt-1 flex shrink-0 items-center gap-0.5">
            {onEdit && (
              <Button
                type="button"
                onClick={() => onEdit(habit)}
                variant="ghost"
                size="sm"
                className="h-11 w-11 shrink-0 touch-manipulation rounded-xl p-0 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label={`${habit.title} 수정`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                onClick={() => onDelete(habit)}
                variant="ghost"
                size="sm"
                className="h-11 w-11 shrink-0 touch-manipulation rounded-xl p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label={`${habit.title} 삭제`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl bg-background/55 px-3 py-3 ring-1 ring-border/60 dark:bg-background/20">
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">오늘의 진행도</p>
              <p className="mt-0.5 break-words text-sm font-semibold leading-5 text-foreground">
                {getProgressMessage(habit)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-bold tabular-nums text-primary">
                {todayProgress}
                <span className="text-sm font-semibold text-muted-foreground">/{dailyTarget}</span>
              </p>
              <p className="text-[11px] font-medium tabular-nums text-muted-foreground">
                {Math.round(progressPercentage)}%
              </p>
            </div>
          </div>
          <Progress
            value={progressPercentage}
            className="mt-3 h-2.5 overflow-hidden"
            aria-label={`${habit.title} 오늘 진행률`}
            glow
          />
        </div>

        {completed ? (
          <p className="friendly-heading rounded-xl bg-primary/8 px-3 py-3 text-center text-sm font-bold leading-5 text-primary">
            오늘도 해냈어요. 이 흐름 그대로 이어가요!
          </p>
        ) : (
          <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3 rounded-2xl border border-border/70 bg-card/70 p-2">
            <Button
              type="button"
              onClick={() => onNegative(habit.id)}
              variant="outline"
              size="sm"
              className="h-11 w-11 touch-manipulation rounded-xl p-0"
              disabled={!canDecrement}
              aria-label={`${habit.title} 진행 횟수 줄이기`}
            >
              <Minus className="h-5 w-5" />
            </Button>

            <div className="min-w-0 text-center">
              <p className="text-xs font-medium text-muted-foreground">오늘 실천</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-foreground">
                {todayProgress}회
              </p>
            </div>

            <Button
              type="button"
              onClick={() => onPositive(habit.id)}
              variant="default"
              size="sm"
              className="h-11 w-11 touch-manipulation rounded-xl p-0"
              disabled={!canIncrement}
              aria-label={`${habit.title} 진행 횟수 늘리기`}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
