'use client';

import { Todo, TodoStatus } from '../types/todo';

interface SimpleTodoCardProps {
  todo: Todo;
  onStatusChange: (id: string, status: TodoStatus) => void;
}

export default function SimpleTodoCard({ todo, onStatusChange }: SimpleTodoCardProps) {
  const isDone = todo.status === TodoStatus.DONE;

  return (
    <div
      className={`
        group relative bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm 
        hover:shadow-md transition-all duration-200 border-l-4
        ${isDone 
          ? 'border-l-green-500 opacity-70' 
          : todo.status === TodoStatus.IN_PROGRESS 
          ? 'border-l-blue-500' 
          : 'border-l-gray-300'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* 체크박스 */}
        <button
          onClick={() => {
            if (todo.status === TodoStatus.DONE) {
              onStatusChange(todo.id, TodoStatus.TODO);
            } else {
              onStatusChange(todo.id, TodoStatus.DONE);
            }
          }}
          className={`
            flex-shrink-0 w-6 h-6 rounded-full border-2 
            flex items-center justify-center transition-all
            ${isDone 
              ? 'bg-green-500 border-green-500' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
            }
          `}
        >
          {isDone && (
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
          <h3 className={`font-medium text-gray-900 dark:text-gray-100 ${isDone ? 'line-through' : ''}`}>
            {todo.title}
          </h3>
        </div>

        {/* 포인트 */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
            ⭐ {todo.rewardPoints}P
          </span>

          {/* 진행 중 버튼 */}
          {!isDone && (
            <button
              onClick={() => {
                const newStatus = todo.status === TodoStatus.IN_PROGRESS 
                  ? TodoStatus.TODO 
                  : TodoStatus.IN_PROGRESS;
                onStatusChange(todo.id, newStatus);
              }}
              className={`
                px-3 py-1 rounded-full text-xs font-medium transition-all
                ${todo.status === TodoStatus.IN_PROGRESS
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900'
                }
              `}
            >
              {todo.status === TodoStatus.IN_PROGRESS ? '🚀 진행중' : '시작'}
            </button>
          )}
        </div>
      </div>

      {/* 획득한 보상 */}
      {todo.earnedReward && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30">
          <div className="flex items-center gap-2">
            <span className="text-lg">{todo.earnedReward.iconUrl}</span>
            <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-200">
              🎉 {todo.earnedReward.name} 획득!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
