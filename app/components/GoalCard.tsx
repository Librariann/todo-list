'use client';

import { GoalFrequency } from '../types/todo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface GoalWithCompletion {
  id: string;
  title: string;
  frequency: GoalFrequency;
  completedDates: string[];
  streak: number;
  createdAt: Date;
  completed: boolean; // 선택된 날짜의 완료 여부
}

interface GoalCardProps {
  goal: GoalWithCompletion;
  onToggle: (id: string) => void;
}

export default function GoalCard({ goal, onToggle }: GoalCardProps) {
  const getFrequencyText = (frequency: GoalFrequency) => {
    switch (frequency) {
      case GoalFrequency.DAILY:
        return '매일';
      case GoalFrequency.WEEKLY:
        return '매주';
      case GoalFrequency.MONTHLY:
        return '매월';
      default:
        return '';
    }
  };

  return (
    <Card
      className={`
      group relative p-4 hover:shadow-md transition-all duration-200 border-l-4
      ${
        goal.completed
          ? 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
          : 'border-l-primary'
      }
    `}
    >
      <div className="flex items-center gap-3">
        {/* 체크박스 */}
        <Button
          onClick={() => onToggle(goal.id)}
          variant="ghost"
          size="sm"
          disabled={goal.completed}
          aria-disabled={goal.completed}
          className={`
            flex-shrink-0 w-6 h-6 rounded border-2 p-0
            ${
              goal.completed
                ? 'bg-amber-500 border-amber-500 cursor-not-allowed opacity-100 hover:bg-amber-500'
                : 'border-muted-foreground hover:border-primary'
            }
          `}
        >
          {goal.completed && <Check className="w-4 h-4 text-white" />}
        </Button>

        {/* 제목 */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium text-foreground ${goal.completed ? 'line-through opacity-70' : ''}`}
          >
            {goal.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {getFrequencyText(goal.frequency)}
            </Badge>
            {goal.streak > 0 && (
              <Badge
                variant="outline"
                className="text-xs bg-orange-50 dark:bg-orange-900/15 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/30"
              >
                🔥 {goal.streak}일 연속
              </Badge>
            )}
          </div>
          {goal.completed && (
            <p className="mt-2 text-xs text-muted-foreground">완료된 목표는 취소할 수 없어요</p>
          )}
        </div>
      </div>
    </Card>
  );
}
