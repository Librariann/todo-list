'use client';

import { Habit } from '../types/todo';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface HabitCardProps {
  habit: Habit;
  onPositive: (id: string) => void;
  onNegative: (id: string) => void;
}

export default function HabitCard({ habit, onPositive, onNegative }: HabitCardProps) {
  const dailyTarget = habit.dailyTarget || 5;
  const today = new Date().toISOString().split('T')[0];
  const todayProgress = habit.dailyProgress?.[today] || 0;
  const progressPercentage = Math.min((todayProgress / dailyTarget) * 100, 100);
  
  const calculateStreak = () => {
    if (!habit.dailyProgress) return 0;
    let streak = 0;
    const currentDate = new Date();
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayProgress = habit.dailyProgress[dateStr] || 0;
      
      if (dayProgress >= dailyTarget) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };
  
  const streakDays = calculateStreak();
  const isCompletedToday = todayProgress >= dailyTarget;

  const getHabitIcon = () => "💪";

  const getProgressColor = () => {
    if (progressPercentage >= 100) return "text-emerald-600";
    if (progressPercentage >= 60) return "text-blue-600";
    return "text-gray-600";
  };

  const getProgressMessage = () => {
    if (isCompletedToday) return "🎉 오늘 목표 달성 완료!";
    if (progressPercentage >= 80) return "🔥 거의 다 왔어요!";
    if (progressPercentage >= 50) return "💪 좋은 페이스!";
    return "💡 시작해보세요!";
  };

  return (
    <Card className={`group relative p-4 hover:shadow-md transition-all duration-200 border-l-4 ${
      isCompletedToday ? 'border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20' : 'border-l-primary'
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
                 {isCompletedToday && (
                   <Badge className="text-xs bg-emerald-500 text-white">
                     ✅ 완료
                   </Badge>
                 )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${getProgressColor()}`}>
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
            <span className="text-sm font-medium">{getProgressMessage()}</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {isCompletedToday ? (
          <div className="flex items-center justify-center py-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <span className="text-emerald-700 dark:text-emerald-400 font-medium text-sm">
              🎉 오늘 목표를 모두 달성했어요! 내일 다시 도전해보세요.
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={() => onNegative(habit.id)}
              variant="outline"
              size="sm"
              className="flex-1 max-w-20"
              disabled={todayProgress <= 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1 px-4">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium min-w-12 text-center">
                {todayProgress}회
              </span>
            </div>
            
            <Button
              onClick={() => onPositive(habit.id)}
              variant="outline"
              size="sm"
              className="flex-1 max-w-20"
              disabled={todayProgress >= dailyTarget}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
