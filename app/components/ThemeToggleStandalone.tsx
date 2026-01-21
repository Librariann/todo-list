'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggleStandalone() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-10 h-10 p-2 animate-pulse"
        aria-label="Loading theme"
        disabled
      />
    );
  }

  return (
    <Button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      variant="outline"
      size="sm"
      className="w-10 h-10 p-2 transition-all duration-200"
      aria-label="Toggle theme"
      title={resolvedTheme === 'dark' ? '라이트 모드로 전환 ☀️' : '다크 모드로 전환 🌙'}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-4 w-4 text-yellow-400" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
