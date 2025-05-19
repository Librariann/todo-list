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

      {/* 획득한 보상 */}
      {stats.earnedRewards.length > 0 && (
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <p className="text-xs opacity-80 mb-2">최근 보상</p>
          <div className="flex gap-2 overflow-x-auto">
            {stats.earnedRewards.slice(0, 3).map((reward) => (
              <div
                key={reward.id}
                className="flex-shrink-0 bg-white/20 rounded-lg px-3 py-2 text-center"
              >
                <span className="text-2xl block">{reward.iconUrl}</span>
                <p className="text-xs mt-1 whitespace-nowrap">{reward.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
