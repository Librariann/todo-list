'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Shield } from 'lucide-react';
import ThemeToggleStandalone from './ThemeToggleStandalone';
import { useAuthStore } from '../store/authStore';
import { apiFetch } from '../lib/apiClient';

type MainTabType = 'tasks' | 'rewards' | 'challenges';
type TaskTabType = 'home' | 'habits' | 'goals' | 'todos';

interface HeaderProps {
  mainTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
  taskTab?: TaskTabType;
  onTaskTabChange?: (tab: TaskTabType) => void;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

const navigation: Array<{
  key: string;
  label: string;
  mainTab: MainTabType;
  taskTab?: TaskTabType;
}> = [
  { key: 'home', label: '오늘', mainTab: 'tasks' },
  { key: 'challenges', label: '챌린지', mainTab: 'challenges' },
  { key: 'rewards', label: '포인트', mainTab: 'rewards' },
];

export default function Header({ mainTab, onTabChange, onTaskTabChange }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, clearAuth, accessToken, setUser } = useAuthStore();
  const isAdminPage = pathname === '/admin';

  useEffect(() => {
    if (!isAuthenticated) return;

    const syncCurrentUser = async () => {
      try {
        const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`);
        if (!response.ok) return;

        const json = await response.json();
        const data = json.data ?? json;
        setUser({
          id: data.id,
          username: data.nickname || data.name || data.email,
          name: data.name || '',
          email: data.email,
          role: data.role,
        });
      } catch {
        // apiFetch가 인증 만료를 처리하므로 여기서는 기존 사용자 정보를 유지한다.
      }
    };

    void syncCurrentUser();
  }, [isAuthenticated, setUser]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  const handleNavigate = (item: (typeof navigation)[number]) => {
    onTabChange(item.mainTab);
    if (item.taskTab) onTaskTabChange?.(item.taskTab);
  };

  const isItemActive = (item: (typeof navigation)[number]) => item.mainTab === mainTab;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="flex min-h-20 items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-2" aria-label="GrowDo 홈">
            <span className="friendly-heading text-2xl font-bold tracking-[-0.06em] text-foreground">
              GrowDo
            </span>
          </Link>

          {!isAdminPage && (
            <nav className="hidden items-center gap-1 md:flex" aria-label="주요 메뉴">
              {navigation.map((item) => {
                const active = isItemActive(item);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavigate(item)}
                    className={`relative flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-[oklch(0.94_0.035_145)] text-[oklch(0.42_0.11_145)] dark:bg-secondary dark:text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}

          <div className="flex items-center gap-2">
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link
                href={isAdminPage ? '/' : '/admin'}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#2e8c54]/25 bg-[#e4eddf] px-3 text-sm font-bold text-[#216c40] transition-colors hover:bg-[#d8e7d2] dark:border-primary/30 dark:bg-secondary dark:text-primary sm:px-4"
                aria-label={isAdminPage ? 'GrowDo 홈으로 이동' : '관리자 페이지로 이동'}
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">{isAdminPage ? '홈으로' : '관리자'}</span>
              </Link>
            )}
            {isAuthenticated && (
              <span className="hidden max-w-36 truncate rounded-full bg-muted px-3 py-2 text-sm font-medium text-foreground lg:block">
                {user?.username || '사용자'}님
              </span>
            )}
            <ThemeToggleStandalone />
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="로그아웃"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {!isAdminPage && (
        <nav
          className="fixed inset-x-0 bottom-0 z-50 flex overflow-x-auto border-t border-border bg-card px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(32,54,39,0.06)] md:hidden"
          aria-label="모바일 주요 메뉴"
        >
          {navigation.map((item) => {
            const active = isItemActive(item);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavigate(item)}
                className={`relative flex min-h-12 min-w-[4.3rem] flex-1 items-center justify-center rounded-xl text-xs font-semibold transition-colors ${
                  active ? 'bg-secondary text-primary' : 'text-muted-foreground'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
                {active && <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary" />}
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
}
