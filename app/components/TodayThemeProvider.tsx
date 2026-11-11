'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { TodayTheme, useTodayTheme } from '@/app/hooks/useTodayTheme';
import { cn } from '@/lib/utils';
import nightStyles from '@/app/components/home/NightObservatory.module.css';
import skinStyles from '@/app/components/home/TodaySkins.module.css';
import styles from './TodayThemeScope.module.css';

interface TodayThemeContextValue {
  theme: TodayTheme;
  selectTheme: (theme: TodayTheme) => void;
}

const TodayThemeContext = createContext<TodayThemeContextValue>({
  theme: TodayTheme.Default,
  selectTheme: () => {},
});

function themeScope(theme: TodayTheme) {
  if (theme === TodayTheme.Default) return undefined;
  const palette = theme === TodayTheme.Night ? nightStyles.palette : skinStyles.palette;
  return { 'data-workspace-skin': theme, className: cn(palette, styles.scope) };
}

export function useActiveTodayTheme() {
  return useContext(TodayThemeContext);
}

export function useTodayThemeScope() {
  return themeScope(useActiveTodayTheme().theme);
}

interface TodayThemeProviderProps {
  children: ReactNode;
  enabled: boolean;
  userId?: number;
}

export default function TodayThemeProvider({ children, enabled, userId }: TodayThemeProviderProps) {
  const { theme: selectedTheme, selectTheme } = useTodayTheme(userId);
  const theme = enabled ? selectedTheme : TodayTheme.Default;
  const value = useMemo(() => ({ theme, selectTheme }), [theme, selectTheme]);
  const scope = themeScope(theme);

  return (
    <TodayThemeContext.Provider value={value}>
      <div data-workspace-skin={scope?.['data-workspace-skin']} className={cn('contents', scope?.className, scope && 'text-foreground')}>
        {children}
      </div>
    </TodayThemeContext.Provider>
  );
}
