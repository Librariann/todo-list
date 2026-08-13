'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Challenge, ChallengeType } from '@/app/types/todo';

interface ChallengeCardProps {
  challenge: Challenge;
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const progress = Math.min((challenge.currentCount / challenge.targetCount) * 100, 100);
  const hasReachedTarget = challenge.currentCount >= challenge.targetCount;
  const isCompleted = challenge.completed || hasReachedTarget;

  const getTypeBadgeCls = (type: ChallengeType) => {
    switch (type) {
      case ChallengeType.DAILY:
        return 'bg-sky-100 dark:bg-sky-900/25 text-sky-700 dark:text-sky-300';
      case ChallengeType.WEEKLY:
        return 'bg-amber-100 dark:bg-amber-900/25 text-amber-700 dark:text-amber-300';
      default:
        return 'bg-emerald-100 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-300';
    }
  };

  const getTypeLabel = (type: ChallengeType) => {
    switch (type) {
      case ChallengeType.DAILY:
        return '일일';
      case ChallengeType.WEEKLY:
        return '주간';
      default:
        return '월간';
    }
  };

  return (
    <Card
      className={`
      relative rounded-[1.35rem] p-5 shadow-none transition-colors
      border ${
        isCompleted
          ? 'border-primary/30 bg-secondary/50'
          : 'border-stone-200 dark:border-white/[0.07]'
      }
    `}
    >
      {challenge.completed && (
        <Badge className="absolute right-3 top-3 rounded-full bg-primary text-xs text-white">받기 완료</Badge>
      )}

      <div className="flex items-start">
        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${getTypeBadgeCls(challenge.type)}`}
            >
              {getTypeLabel(challenge.type)}
            </span>
            <h3 className="font-semibold text-foreground text-sm">{challenge.title}</h3>
          </div>

          {challenge.description && (
            <p className="text-xs text-muted-foreground mb-3">{challenge.description}</p>
          )}

          {/* 진행도 */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">진행도</span>
              <span className="text-xs font-semibold text-foreground">
                {challenge.currentCount} / {challenge.targetCount}
              </span>
            </div>
            <Progress value={progress} className="h-2.5" glow />
          </div>

          {/* 보상 상태 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
              +{challenge.rewardPoints}pt
            </span>
            {challenge.completed ? (
              <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                받기 완료
              </span>
            ) : hasReachedTarget ? (
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                지급 처리 중...
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">달성 시 자동 지급</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
