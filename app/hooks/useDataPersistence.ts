'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { Todo, Habit, UserStats, Goal } from '@/app/types/todo';
import { getUserStorage } from '@/app/lib/storage';

interface UseDataPersistenceProps {
  todos: Todo[];
  habits: Habit[];
  goals: Goal[];
  userStats: UserStats;
  onDataLoaded: (data: {
    todos: Todo[];
    habits: Habit[];
    goals: Goal[];
    userStats: UserStats;
  }) => void;
}

export function useDataPersistence({
  todos,
  habits,
  goals,
  userStats,
  onDataLoaded,
}: UseDataPersistenceProps) {
  const { user } = useAuthStore();
  const isInitialized = useRef(false);
  const lastSaveTime = useRef<number>(0);

  const userId = user?.email;

  useEffect(() => {
    if (!userId || isInitialized.current) return;

    const storage = getUserStorage(userId);
    if (!storage) return;

    const storedData = storage.getAllData();

    if (storedData) {
      onDataLoaded({
        todos: storedData.todos,
        habits: storedData.habits,
        goals: storedData.goals,
        userStats: storedData.userStats,
      });
    } else {
      storage.saveAllData({
        todos,
        habits,
        goals,
        userStats,
      });
    }

    isInitialized.current = true;
  }, [userId, onDataLoaded]);

  useEffect(() => {
    if (!userId || !isInitialized.current) return;

    const now = Date.now();
    if (now - lastSaveTime.current < 1000) return;

    const storage = getUserStorage(userId);
    if (!storage) return;

    storage.saveAllData({
      todos,
      habits,
      goals,
      userStats,
    });

    lastSaveTime.current = now;
  }, [todos, habits, goals, userStats, userId]);

  return {
    isLoaded: isInitialized.current,
    userId,
    storage: userId ? getUserStorage(userId) : null,
  };
}
