'use client';

import { GoalFrequency, type GoalWithDate } from '../types/todo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Trash2 } from 'lucide-react';

interface GoalCardProps {
  goal: GoalWithDate;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function GoalCard({ goal, onToggle, onDelete }: GoalCardProps) {
  const [, startMonth, startDay] = goal.startDate.split('-');
  const createdDateLabel = `${Number(startMonth)}월 ${Number(startDay)}일 생성`;

  const formatPeriodDate = (date: string) => {
    const [, month, day] = date.split('-');
    return `${Number(month)}월 ${Number(day)}일`;
  };

  const periodLabel = `${formatPeriodDate(goal.period.start)}~${formatPeriodDate(goal.period.end)}`;

  const completionLabel = (() => {
    if (goal.period.status === 'ACHIEVED') {
      if (!goal.period.achievedAt) return '이 기간의 목표를 완료했어요.';
      const weekday = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        weekday: 'long',
      }).format(new Date(goal.period.achievedAt));
      return `${weekday}에 완료했어요.`;
    }
    if (goal.period.status === 'MISSED') return '이 기간은 완료하지 못했어요.';
    if (goal.period.status === 'UPCOMING') return '아직 시작 전인 목표예요.';
    if (goal.frequency === GoalFrequency.WEEKLY) return '이번 주 안에 완료해요.';
    if (goal.frequency === GoalFrequency.MONTHLY) return '이번 달 안에 완료해요.';
    return '오늘 안에 완료해요.';
  })();

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

  const getStreakText = (frequency: GoalFrequency, streak: number) => {
    switch (frequency) {
      case GoalFrequency.WEEKLY:
        return `${streak}주차 달성`;
      case GoalFrequency.MONTHLY:
        return `${streak}개월차 달성`;
      case GoalFrequency.DAILY:
      default:
        return `${streak}일 연속`;
    }
  };

  return (
    <article
      className={`companion-entry group relative ${goal.completed ? 'border-primary/25 bg-secondary/55' : ''}`}
    >
      <div className="flex items-center gap-3">
        {/* 체크박스 */}
        <Button
          onClick={() => onToggle(goal.id)}
          variant="ghost"
          size="sm"
          disabled={!goal.period.canAchieve}
          aria-disabled={!goal.period.canAchieve}
          aria-label={goal.period.canAchieve ? `${goal.title} 완료` : completionLabel}
          className={`
            h-11 w-11 flex-shrink-0 rounded-[14px] border-2 p-0
            ${
              goal.completed
                ? 'bg-primary border-primary cursor-not-allowed opacity-100 hover:bg-primary'
                : goal.period.canAchieve
                  ? 'border-muted-foreground hover:border-primary'
                  : 'cursor-not-allowed border-muted-foreground/35 opacity-65'
            }
          `}
        >
          {goal.completed ? <Check className="h-4 w-4 text-white" /> : null}
        </Button>

        {/* 제목 */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium text-foreground ${goal.completed ? 'line-through opacity-70' : ''}`}
          >
            {goal.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full text-xs">
              {getFrequencyText(goal.frequency)}
            </Badge>
            <span className="text-xs font-semibold text-[#2e8c54] dark:text-primary">
              {periodLabel}
            </span>
            {goal.frequency !== GoalFrequency.DAILY ? (
              <span className="text-xs text-muted-foreground">
                {goal.period.index}
                {goal.frequency === GoalFrequency.WEEKLY ? '주차' : '회차'}
              </span>
            ) : null}
            <span className="text-xs text-muted-foreground">{createdDateLabel}</span>
            {goal.streak > 0 ? (
              <Badge
                variant="outline"
                className="rounded-full text-xs bg-orange-50 dark:bg-orange-900/15 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/30"
              >
                {getStreakText(goal.frequency, goal.streak)}
              </Badge>
            ) : null}
          </div>
          <p
            className={`mt-2 text-xs font-medium ${
              goal.period.status === 'ACHIEVED'
                ? 'text-[#25834b] dark:text-[#68d391]'
                : goal.period.status === 'MISSED'
                  ? 'text-destructive/80'
                  : 'text-muted-foreground'
            }`}
          >
            {completionLabel}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => onDelete(goal.id)}
          variant="ghost"
          size="sm"
          className="h-11 w-11 flex-shrink-0 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={`${goal.title} 삭제`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}
