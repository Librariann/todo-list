'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Award,
  House,
  ListChecks,
  LogOut,
  Repeat2,
  Shield,
  Star,
  Target,
} from 'lucide-react';
import ThemeToggleStandalone from './ThemeToggleStandalone';
import { useAuthStore } from '../store/authStore';

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
  icon: typeof House;
  mainTab: MainTabType;
  taskTab?: TaskTabType;
}> = [
  { key: 'home', label: '홈', icon: House, mainTab: 'tasks', taskTab: 'home' },
  { key: 'todos', label: '할 일', icon: ListChecks, mainTab: 'tasks', taskTab: 'todos' },
  { key: 'habits', label: '습관', icon: Repeat2, mainTab: 'tasks', taskTab: 'habits' },
  { key: 'goals', label: '목표', icon: Target, mainTab: 'tasks', taskTab: 'goals' },
  { key: 'challenges', label: '챌린지', icon: Award, mainTab: 'challenges' },
  { key: 'rewards', label: '포인트', icon: Star, mainTab: 'rewards' },
];

export default function Header({ mainTab, onTabChange, taskTab, onTaskTabChange }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, clearAuth, accessToken } = useAuthStore();
  const isAdminPage = pathname === '/admin';

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

  const isItemActive = (item: (typeof navigation)[number]) =>
    item.mainTab === mainTab && (item.mainTab !== 'tasks' || item.taskTab === taskTab);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2" aria-label="GrowDo 홈">
            <span className="friendly-heading text-2xl font-bold tracking-[-0.06em] text-primary">GrowDo</span>
          </Link>

          {!isAdminPage && (
            <nav className="hidden items-center gap-1 md:flex" aria-label="주요 메뉴">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);
                return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNavigate(item)}
                  className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-secondary text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
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
                className="hidden h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
              >
                <Shield className="h-4 w-4" />
                {isAdminPage ? '홈으로' : '관리'}
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
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleNavigate(item)}
              className={`flex min-h-12 min-w-[4.3rem] flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition-colors ${
                active ? 'bg-secondary text-primary' : 'text-muted-foreground'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-4 w-4" strokeWidth={1.8} />
              {item.label}
            </button>
            );
          })}
        </nav>
      )}
    </>
  );
}
