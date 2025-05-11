'use client';

import { Reward } from '../types/todo';

interface RewardShopProps {
  rewards: Reward[];
  userPoints: number;
  onClaim: (reward: Reward) => void;
}

export default function RewardShop({ rewards, userPoints, onClaim }: RewardShopProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">🎁 보상 상점</h2>
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg font-bold">
          ⭐ {userPoints} 포인트
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rewards.map((reward) => {
          const canAfford = userPoints >= reward.value;
          
          return (
            <div
              key={reward.id}
              className={`
                relative rounded-xl p-4 border-2 transition-all duration-200
                ${
                  canAfford
                    ? 'border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 hover:shadow-lg hover:scale-105'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 opacity-60'
                }
              `}
            >
              {/* 아이콘 */}
              <div className="text-center mb-3">
                <span className="text-5xl">{reward.iconUrl}</span>
              </div>

              {/* 정보 */}
              <div className="text-center mb-3">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {reward.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {reward.description}
                </p>
              </div>

              {/* 가격 */}
              <div className="flex items-center justify-center gap-1 mb-3">
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  ⭐ {reward.value}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">포인트</span>
              </div>

              {/* 구매 버튼 */}
              <button
                onClick={() => canAfford && onClaim(reward)}
                disabled={!canAfford}
                className={`
                  w-full py-2 rounded-lg font-semibold text-sm transition-all
                  ${
                    canAfford
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 active:scale-95'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {canAfford ? '교환하기' : '포인트 부족'}
              </button>

              {/* 부족한 포인트 표시 */}
              {!canAfford && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  -{reward.value - userPoints}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 더 많은 보상 추가 예정 메시지 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-center text-gray-700 dark:text-gray-300">
          🎯 더 많은 보상이 곧 추가됩니다! 계속 할 일을 완료하고 포인트를 모아보세요.
        </p>
      </div>
    </div>
  );
}
