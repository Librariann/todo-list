'use client';

import { UserStats } from '../types/todo';

interface SimpleStatsCardProps {
  stats: UserStats;
}

export default function SimpleStatsCard({ stats }: SimpleStatsCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-700 to-slate-600 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">내 통계</h2>
        <span className="text-2xl">🏆</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <p className="text-xs opacity-80 mb-1">총 포인트</p>
          <p className="text-2xl font-bold">⭐ {stats.totalPoints}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <p className="text-xs opacity-80 mb-1">연속 달성</p>
          <p className="text-2xl font-bold">🔥 {stats.currentStreak}일</p>
        </div>
      </div>

      {/* 최근 획득한 보상 */}
      {stats.recentRewards && stats.recentRewards.length > 0 && (
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <p className="text-xs opacity-80 mb-2 flex items-center gap-1">
            <span>🎁</span> 최근 보상
          </p>
          <div className="space-y-2">
            {stats.recentRewards.slice(0, 2).map((reward) => (
              <div
                key={reward.id}
                className="bg-white/20 rounded-lg px-3 py-2 flex items-center gap-2"
              >
                <span className="text-xl">{reward.iconUrl}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{reward.name}</p>
                  <p className="text-[10px] opacity-70 truncate">{reward.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 최근 달성한 도전과제 */}
      {stats.recentCompletedChallenges && stats.recentCompletedChallenges.length > 0 && (
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <p className="text-xs opacity-80 mb-2 flex items-center gap-1">
            <span>🏆</span> 최근 달성 도전과제
          </p>
          <div className="space-y-2">
            {stats.recentCompletedChallenges.slice(0, 2).map((challenge) => (
              <div
                key={challenge.id}
                className="bg-white/20 rounded-lg px-3 py-2 flex items-center gap-2"
              >
                <span className="text-xl">{challenge.iconUrl}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{challenge.title}</p>
                  <p className="text-[10px] opacity-70 truncate">+{challenge.rewardPoints} 포인트</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
