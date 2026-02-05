'use client';

import { Challenge, ChallengeType } from '../types/todo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ChallengeCardProps {
  challenge: Challenge;
  onClaim?: (id: string) => void;
}

export default function ChallengeCard({ challenge, onClaim }: ChallengeCardProps) {
  const progress = Math.min((challenge.currentCount / challenge.targetCount) * 100, 100);
  const isCompleted = challenge.completed || challenge.currentCount >= challenge.targetCount;
  const canClaim = !challenge.completed && challenge.currentCount >= challenge.targetCount;

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

  const getTypeIconBg = (type: ChallengeType) => {
    switch (type) {
      case ChallengeType.DAILY:
        return 'bg-sky-50 dark:bg-sky-900/20';
      case ChallengeType.WEEKLY:
        return 'bg-amber-50 dark:bg-amber-900/20';
      default:
        return 'bg-emerald-50 dark:bg-emerald-900/20';
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
      relative p-5 hover:shadow-md transition-all duration-200
      border ${
        isCompleted
          ? 'border-emerald-400 dark:border-emerald-700/60 bg-emerald-50/40 dark:bg-emerald-900/10'
          : 'border-stone-200 dark:border-white/[0.07]'
      }
    `}
    >
      {challenge.completed && (
        <Badge className="absolute top-3 right-3 bg-emerald-500 text-white text-xs">✓ 완료</Badge>
      )}

      <div className="flex items-start gap-4">
        {/* 아이콘 */}
        <div
          className={`flex-shrink-0 w-13 h-13 w-12 h-12 rounded-xl ${getTypeIconBg(challenge.type)} flex items-center justify-center text-2xl`}
        >
          {challenge.iconUrl || '🎯'}
        </div>

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
            <Progress value={progress} className="h-2" />
          </div>

          {/* 보상 & 버튼 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-primary">+{challenge.rewardPoints}pt</span>
            {canClaim && onClaim && (
              <Button
                onClick={() => onClaim(challenge.id)}
                size="sm"
                className="bg-primary hover:opacity-90 text-primary-foreground"
              >
                보상 받기
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
