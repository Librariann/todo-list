'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProgressMetrics, getRewardTier, generateAchievements } from '../lib/rewardUtils';

interface EnhancedStatsCardProps {
  metrics: ProgressMetrics;
  totalPoints: number;
}

export default function EnhancedStatsCard({ metrics, totalPoints }: EnhancedStatsCardProps) {
  const tierInfo = getRewardTier(totalPoints);
  const achievements = generateAchievements(metrics);

  const getTierColor = () => {
    switch (tierInfo.tier) {
      case '브론즈':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case '실버':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case '골드':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case '플래티넘':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case '다이아몬드':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case '마스터':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
              <div className="flex items-center gap-2">
                <Badge className={`${getTierColor()} font-semibold`}>{tierInfo.tier} 티어</Badge>
                <span className="text-2xl font-bold">{totalPoints.toLocaleString()}pt</span>
              </div>
              {tierInfo.tier !== '마스터' && (
                <p className="text-sm text-muted-foreground">
                  다음 티어까지 {tierInfo.nextTierPoints - totalPoints}pt
                </p>
              )}
          </div>
          <div className="text-right">
            <div className="text-emerald-600">
              <span className="font-semibold">+{metrics.totalPointsEarned}pt</span>
            </div>
            <p className="text-xs text-muted-foreground">오늘 획득</p>
          </div>
        </div>

        {tierInfo.tier !== '마스터' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>티어 진행도</span>
              <span>{Math.round(tierInfo.progress)}%</span>
            </div>
            <Progress value={tierInfo.progress} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="mb-1 flex items-center justify-center">
              <span className="font-semibold text-sm">습관</span>
            </div>
            <div className="text-lg font-bold">
              {metrics.habitsCompletedToday}/{metrics.totalHabitsToday}
            </div>
            <div className="text-xs text-muted-foreground">
              평균 {metrics.averageHabitStreak}일 연속
            </div>
          </div>

          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="mb-1 flex items-center justify-center">
              <span className="font-semibold text-sm">목표</span>
            </div>
            <div className="text-lg font-bold">
              {metrics.goalsCompletedToday}/{metrics.totalGoalsToday}
            </div>
            <div className="text-xs text-muted-foreground">{metrics.perfectDays}일 완벽한 날</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="mb-1 flex items-center justify-center">
              <span className="font-semibold text-sm">할일</span>
            </div>
            <div className="text-lg font-bold">
              {metrics.todosCompletedToday}/{metrics.totalTodosToday}
            </div>
            <div className="text-xs text-muted-foreground">오늘 완료</div>
          </div>
        </div>

        {achievements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">오늘의 성취</h4>
            <div className="flex flex-wrap gap-2">
              {achievements.map((achievement, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                >
                  {achievement}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
