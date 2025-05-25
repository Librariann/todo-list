'use client';

import { Challenge, ChallengeType } from '../types/todo';

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
    <div
      className={`
        relative bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 
        border-2 ${isCompleted ? 'border-emerald-500' : 'border-gray-200 dark:border-gray-700'}
        ${isCompleted ? 'bg-gradient-to-br from-emerald-50/50 to-cyan-50/50 dark:from-emerald-950/20 dark:to-cyan-950/20' : ''}
      `}
    >
      {/* 완료 뱃지 */}
      {challenge.completed && (
        <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-bold">
          ✓ 완료
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* 아이콘 */}
        <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${getTypeColor(challenge.type)} flex items-center justify-center text-3xl`}>
          {challenge.iconUrl || '🎯'}
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${getTypeColor(challenge.type)} text-white`}>
              {getTypeBadge(challenge.type)}
            </span>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">
              {challenge.title}
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {challenge.description}
          </p>

          {/* 진행도 바 */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                진행도
              </span>
              <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                {challenge.currentCount} / {challenge.targetCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getTypeColor(challenge.type)} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 보상 & 버튼 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                🏅 +{challenge.rewardPoints}P
              </span>
            </div>

            {canClaim && onClaim && (
              <button
                onClick={() => onClaim(challenge.id)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                보상 받기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
