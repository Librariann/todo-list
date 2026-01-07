'use client';

import { Challenge, ChallengeType } from '../types/todo';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ChallengeCardProps {
  challenge: Challenge;
  onClaim?: (id: string) => void;
}

export default function ChallengeCard({ challenge, onClaim }: ChallengeCardProps) {
  const progress = Math.min((challenge.currentCount / challenge.targetCount) * 100, 100);
  const isCompleted = challenge.completed || challenge.currentCount >= challenge.targetCount;
  const canClaim = !challenge.completed && challenge.currentCount >= challenge.targetCount;

  const getTypeColor = (type: ChallengeType) => {
    switch (type) {
      case ChallengeType.DAILY:
        return 'from-blue-500 to-cyan-500';
      case ChallengeType.WEEKLY:
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeBadge = (type: ChallengeType) => {
    switch (type) {
      case ChallengeType.DAILY:
        return '일일';
      case ChallengeType.WEEKLY:
        return '주간';
      default:
        return '';
    }
  };

  return (
    <Card
      className={`
        relative p-5 hover:shadow-md transition-all duration-200 
        border-2 ${isCompleted ? 'border-emerald-500' : 'border-border'}
        ${isCompleted ? 'bg-gradient-to-br from-emerald-50/50 to-cyan-50/50 dark:from-emerald-950/20 dark:to-cyan-950/20' : ''}
      `}
    >
      {/* 완료 뱃지 */}
      {challenge.completed && (
        <Badge className="absolute top-3 right-3 bg-emerald-500 text-white text-xs">
          ✓ 완료
        </Badge>
      )}

      <div className="flex items-start gap-4">
        {/* 아이콘 */}
        <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${getTypeColor(challenge.type)} flex items-center justify-center text-3xl`}>
          {challenge.iconUrl || '🎯'}
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`text-xs font-bold bg-gradient-to-r ${getTypeColor(challenge.type)} text-white border-0`}>
              {getTypeBadge(challenge.type)}
            </Badge>
            <h3 className="font-bold text-foreground">
              {challenge.title}
            </h3>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {challenge.description}
          </p>

          {/* 진행도 바 */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                진행도
              </span>
              <span className="text-xs font-bold text-foreground">
                {challenge.currentCount} / {challenge.targetCount}
              </span>
            </div>
            <Progress value={progress} className="h-2.5" />
          </div>

          {/* 보상 & 버튼 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30">
                🏅 +{challenge.rewardPoints}P
              </Badge>
            </div>

            {canClaim && onClaim && (
              <Button
                onClick={() => onClaim(challenge.id)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg active:scale-95"
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
