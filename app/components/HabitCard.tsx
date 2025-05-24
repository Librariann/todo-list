'use client';

import { Habit, HabitType } from '../types/todo';

interface HabitCardProps {
  habit: Habit;
  onPositive: (id: string) => void;
  onNegative: (id: string) => void;
}

export default function HabitCard({ habit, onPositive, onNegative }: HabitCardProps) {
  const showPositive = habit.habitType === HabitType.POSITIVE || habit.habitType === HabitType.BOTH;
  const showNegative = habit.habitType === HabitType.NEGATIVE || habit.habitType === HabitType.BOTH;

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-indigo-500">
      <div className="flex items-center justify-between gap-3">
        {/* 제목 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {habit.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              + {habit.positiveCount}회
            </span>
            {showNegative && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                - {habit.negativeCount}회
              </span>
            )}
          </div>
        </div>

        {/* 버튼들 */}
        <div className="flex items-center gap-2">
          {showNegative && (
            <button
              onClick={() => onNegative(habit.id)}
              className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all active:scale-95 font-bold text-xl"
              title={`${habit.negativePoints}점`}
            >
              −
            </button>
          )}
          {showPositive && (
            <button
              onClick={() => onPositive(habit.id)}
              className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all active:scale-95 font-bold text-xl"
              title={`+${habit.positivePoints}점`}
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* 포인트 표시 */}
      <div className="mt-2 flex items-center gap-2 text-xs">
        {showPositive && (
          <span className="text-emerald-600 dark:text-emerald-400">
            +{habit.positivePoints}P
          </span>
        )}
        {showNegative && (
          <span className="text-red-600 dark:text-red-400">
            {habit.negativePoints}P
          </span>
        )}
      </div>
    </div>
  );
}
