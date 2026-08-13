'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export default function ThemeToggleStandalone() {
  const [mounted, setMounted] = useState(false);
  const { isDarkMode, setTheme } = useThemeStore();
  const isDark = isDarkMode === 'dark';

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
  }, [isDark, mounted]);

  if (!mounted) {
    return (
      <div className="h-11 w-11 rounded-[14px] border border-border bg-muted" aria-hidden="true" />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-border bg-card text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={isDark ? '밝은 테마로 전환' : '어두운 테마로 전환'}
      aria-pressed={isDark}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
