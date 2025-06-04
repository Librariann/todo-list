'use client';

import { DailyFrequency } from '../types/todo';

interface DailyWithCompletion {
  id: string;
  title: string;
  frequency: DailyFrequency;
  completedDates: string[];
  streak: number;
  createdAt: Date;
  completed: boolean; // 선택된 날짜의 완료 여부
}

interface DailyCardProps {
  daily: DailyWithCompletion;
  onToggle: (id: string) => void;
}

export default function DailyCard({ daily, onToggle }: DailyCardProps) {
  const getFrequencyText = (frequency: DailyFrequency) => {
    switch (frequency) {
      case DailyFrequency.DAILY:
        return '매일';
      case DailyFrequency.WEEKLY:
        return '매주';
      case DailyFrequency.MONTHLY:
        return '매월';
      default:
        return '';
    }
  };

  return (
    <div
      className={`
        group relative bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm 
        hover:shadow-md transition-all duration-200 border-l-4
        ${daily.completed 
          ? 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
          : 'border-l-blue-500'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* 체크박스 */}
        <button
          onClick={() => onToggle(daily.id)}
          className={`
            flex-shrink-0 w-6 h-6 rounded border-2 
            flex items-center justify-center transition-all
            ${daily.completed 
              ? 'bg-emerald-500 border-emerald-500' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
            }
          `}
        >
          {daily.completed && (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* 제목 */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-gray-900 dark:text-gray-100 ${daily.completed ? 'line-through opacity-70' : ''}`}>
            {daily.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {getFrequencyText(daily.frequency)}
            </span>
            {daily.streak > 0 && (
              <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">
                🔥 {daily.streak}일 연속
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
