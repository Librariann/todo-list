'use client';

import { Habit } from '../types/todo';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  getTodayProgress,
  getProgressPercentage,
  isCompletedToday,
  calculateStreak,
  getProgressMessage,
  getProgressColor,
  canIncrementProgress,
  canDecrementProgress
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

  const getHabitIcon = () => "💪";



  return (
    <Card className={`group relative p-4 hover:shadow-md transition-all duration-200 border-l-4 ${
      completed ? 'border-l-amber-500 bg-amber-50/40 dark:bg-amber-900/10' : 'border-l-primary'
    }`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getHabitIcon()}</span>
            <div>
              <h3 className="font-medium text-foreground">
                {habit.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  하루 {dailyTarget}회 목표
                </Badge>
                 {streakDays > 0 && (
                   <Badge variant="outline" className="text-xs text-orange-600">
                     🔥 {streakDays}일 연속
                   </Badge>
                 )}
                 {completed && (
                   <Badge className="text-xs bg-amber-500 text-white">
                     ✅ 완료
                   </Badge>
                 )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${getProgressColor(progressPercentage)}`}>
              {todayProgress}/{dailyTarget}
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round(progressPercentage)}%
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">오늘의 진행도</span>
            <span className="text-sm font-medium">{getProgressMessage(habit)}</span>
          </div>
          <Progress value={progressPercentage} className="h-3" glow />
        </div>

        {completed ? (
          <div className="flex items-center justify-center py-4 bg-amber-50/60 dark:bg-amber-900/10 rounded-lg border border-amber-200/60 dark:border-amber-800/30">
            <span className="text-amber-700 dark:text-amber-400 font-medium text-sm text-center px-2">
              🎉 오늘 목표를 모두 달성했어요! 내일 다시 도전해보세요.
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 sm:gap-2">
            <Button
              onClick={() => onNegative(habit.id)}
              variant="outline"
              size="sm"
              className="flex-1 max-w-16 sm:max-w-20 h-10 touch-manipulation"
              disabled={!canDecrement}
            >
              <Minus className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            
            <div className="flex items-center gap-1 px-3 sm:px-4 min-w-[80px] justify-center">
              <Target className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-center">
                {todayProgress}회
              </span>
            </div>
            
            <Button
              onClick={() => onPositive(habit.id)}
              variant="outline"
              size="sm"
              className="flex-1 max-w-16 sm:max-w-20 h-10 touch-manipulation"
              disabled={!canIncrement}
            >
              <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
