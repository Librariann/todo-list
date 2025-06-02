'use client';

import { useState } from 'react';
import { TaskType, HabitType, DailyFrequency, Habit, Daily, Todo, TodoStatus } from '../types/todo';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskType: TaskType;
  onAdd: (task: Habit | Daily | Todo) => void;
}

export default function AddTaskModal({ isOpen, onClose, taskType, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [habitType, setHabitType] = useState<HabitType>(HabitType.POSITIVE);
  const [frequency, setFrequency] = useState<DailyFrequency>(DailyFrequency.DAILY);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('제목을 입력해주세요');
      return;
    }

    const now = new Date();

    if (taskType === TaskType.HABIT) {
      const newHabit: Habit = {
        id: `h${Date.now()}`,
        title: title.trim(),
        habitType,
        positiveCount: 0,
        negativeCount: 0,
        createdAt: now,
      };
      onAdd(newHabit);
    } else if (taskType === TaskType.DAILY) {
      const newDaily: Daily = {
        id: `d${Date.now()}`,
        title: title.trim(),
        frequency,
        completedDates: [],
        streak: 0,
        createdAt: now,
      };
      onAdd(newDaily);
    } else if (taskType === TaskType.TODO) {
      const newTodo: Todo = {
        id: `t${Date.now()}`,
        title: title.trim(),
        status: TodoStatus.TODO,
        date,
        createdAt: now,
      };
      onAdd(newTodo);
    }

    // 초기화
    setTitle('');
    setHabitType(HabitType.POSITIVE);
    setFrequency(DailyFrequency.DAILY);
    setDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  const getModalTitle = () => {
    switch (taskType) {
      case TaskType.HABIT:
        return '새 습관 추가';
      case TaskType.DAILY:
        return '새 일일목표 추가';
      case TaskType.TODO:
        return '새 할일 추가';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getModalTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 제목 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              제목 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* 습관 타입 선택 */}
          {taskType === TaskType.HABIT && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                습관 타입
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHabitType(HabitType.POSITIVE)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    habitType === HabitType.POSITIVE
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  긍정 (+)
                </button>
                <button
                  type="button"
                  onClick={() => setHabitType(HabitType.NEGATIVE)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    habitType === HabitType.NEGATIVE
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  부정 (-)
                </button>
                <button
                  type="button"
                  onClick={() => setHabitType(HabitType.BOTH)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    habitType === HabitType.BOTH
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  둘 다
                </button>
              </div>
            </div>
          )}



          {/* 일일목표 빈도 선택 */}
          {taskType === TaskType.DAILY && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                반복 주기
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as DailyFrequency)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={DailyFrequency.DAILY}>매일</option>
                <option value={DailyFrequency.WEEKLY}>매주</option>
                <option value={DailyFrequency.MONTHLY}>매월</option>
              </select>
            </div>
          )}



          {/* 할일 날짜 선택 */}
          {taskType === TaskType.TODO && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                날짜
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
            >
              추가하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
