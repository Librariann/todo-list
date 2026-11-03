'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getTodayDateString } from '@/app/lib/dateUtils';
import {
  postNativeWidgetSnapshot,
  subscribeToNativeNavigationMessages,
} from '@/app/lib/nativeBridge';
import { buildNativeWidgetData } from '@/app/lib/nativeWidget';
import { useAuthStore } from '@/app/store/authStore';
import { useHabitsStore } from '@/app/store/habitsStore';
import { useTodosStore } from '@/app/store/todosStore';

interface LoadedWidgetData {
  userId: number;
  date: string;
}

export default function NativeWidgetSync() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id);
  const [bridgeVersion, setBridgeVersion] = useState<number>(0);
  const [today, setToday] = useState<string>(getTodayDateString);
  const [loadedFor, setLoadedFor] = useState<LoadedWidgetData | null>(null);
  const dataReadyRef = useRef<boolean>(false);
  const ownerRef = useRef<number | null>(null);
  const lastSentRef = useRef<string | null>(null);
  const todos = useTodosStore((state) => state.todosByDate[today]);
  const todosLoading = useTodosStore((state) => state.loadingByDate[today] ?? false);
  const todosError = useTodosStore((state) => state.errorsByDate[today]);
  const habits = useHabitsStore((state) => state.habits);
  const habitsLoading = useHabitsStore((state) => state.isLoading);
  const habitsError = useHabitsStore((state) => state.error);

  useEffect(
    () =>
      subscribeToNativeNavigationMessages((message) => {
        if (message.type === 'NATIVE_NAVIGATION_READY') {
          setBridgeVersion((version) => version + 1);
        }
      }),
    []
  );

  useEffect(() => {
    lastSentRef.current = null;
    dataReadyRef.current = false;
    if (!isAuthenticated || userId === undefined) {
      ownerRef.current = null;
      return;
    }
    if (bridgeVersion === 0) return;
    if (ownerRef.current !== userId) {
      // 계정 전환 전에 남아 있거나 진행 중이던 요청이 위젯에 섞이지 않도록 한다.
      useTodosStore.getState().resetTodos();
      useHabitsStore.getState().resetHabits();
      ownerRef.current = userId;
    }

    let active = true;
    let requestVersion = 0;
    let currentDate = getTodayDateString();

    const refresh = async () => {
      const version = ++requestVersion;
      const date = getTodayDateString();
      currentDate = date;
      dataReadyRef.current = false;
      setToday(date);
      setLoadedFor(null);

      await Promise.all([
        useTodosStore.getState().fetchTodos(date),
        useHabitsStore.getState().fetchHabits(),
      ]);

      if (!active || version !== requestVersion) return;
      const todoState = useTodosStore.getState();
      const habitState = useHabitsStore.getState();
      if (todoState.errorsByDate[date] || habitState.error || !todoState.todosByDate[date]) return;
      dataReadyRef.current = true;
      setLoadedFor({ userId, date });
    };

    const handleForeground = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    const dayTimer = window.setInterval(() => {
      if (getTodayDateString() !== currentDate) void refresh();
    }, 30_000);

    void refresh();
    document.addEventListener('visibilitychange', handleForeground);
    window.addEventListener('focus', handleForeground);
    return () => {
      active = false;
      dataReadyRef.current = false;
      window.clearInterval(dayTimer);
      document.removeEventListener('visibilitychange', handleForeground);
      window.removeEventListener('focus', handleForeground);
    };
  }, [bridgeVersion, isAuthenticated, userId]);

  const widgetData = useMemo(
    () => (todos ? buildNativeWidgetData(today, todos, habits) : null),
    [habits, today, todos]
  );

  useEffect(() => {
    if (
      !isAuthenticated ||
      bridgeVersion === 0 ||
      !dataReadyRef.current ||
      !widgetData ||
      loadedFor?.userId !== userId ||
      loadedFor?.date !== today ||
      todosLoading ||
      habitsLoading ||
      todosError ||
      habitsError
    )
      return;

    const fingerprint = JSON.stringify(widgetData);
    if (lastSentRef.current === fingerprint) return;
    if (postNativeWidgetSnapshot({ ...widgetData, updatedAt: new Date().toISOString() })) {
      lastSentRef.current = fingerprint;
    }
  }, [
    bridgeVersion,
    habitsError,
    habitsLoading,
    isAuthenticated,
    loadedFor,
    today,
    todosError,
    todosLoading,
    userId,
    widgetData,
  ]);

  return null;
}
