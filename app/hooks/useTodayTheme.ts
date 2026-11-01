'use client';

import { useEffect, useState } from 'react';

export enum TodayTheme {
  Default = 'default',
  Night = 'night',
  Coast = 'coast',
  Studio = 'studio',
}

export function isTodayTheme(value: unknown): value is TodayTheme {
  return Object.values(TodayTheme).some((theme) => theme === value);
}

interface TodayThemePreference {
  storageKey: string | null;
  theme: TodayTheme;
}

export function useTodayTheme(userId?: number) {
  const storageKey = userId === undefined ? null : `growdo:today-theme:v1:${userId}`;
  const [preference, setPreference] = useState<TodayThemePreference | null>(null);
  const theme = preference?.storageKey === storageKey ? preference.theme : TodayTheme.Default;

  useEffect(() => {
    if (!storageKey) return;

    try {
      const saved = window.localStorage.getItem(storageKey);
      setPreference({
        storageKey,
        theme: isTodayTheme(saved) ? saved : TodayTheme.Default,
      });
    } catch {
      // Storage restrictions must not prevent using the workspace.
    }
  }, [storageKey]);

  const selectTheme = (nextTheme: TodayTheme) => {
    setPreference({ storageKey, theme: nextTheme });
    if (!storageKey) return;

    try {
      window.localStorage.setItem(storageKey, nextTheme);
    } catch {
      // Keep the selection for the current session even if it cannot be saved.
    }
  };

  return { theme, selectTheme };
}
