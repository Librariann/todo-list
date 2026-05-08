'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ThemeToggleStandalone from './ThemeToggleStandalone';
import { useAuthStore } from '../store/authStore';
import { Menu, X } from 'lucide-react';

type MainTabType = 'tasks' | 'rewards' | 'challenges';

interface HeaderProps {
  mainTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export default function Header({
  mainTab,
  onTabChange,
  isMobileMenuOpen,
  onMobileMenuToggle,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, clearAuth, accessToken } = useAuthStore();

  const isLoggedIn = isAuthenticated;
  const isAdminPage = pathname === '/admin';

  const handleMobileTabClick = (tab: MainTabType) => {
    onTabChange(tab);
    onMobileMenuToggle();
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch {
      // 백엔드 로그아웃 실패해도 프론트 상태는 초기화
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[oklch(0.168_0.03_248)]/90 backdrop-blur border-b border-stone-200 dark:border-white/[0.07] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-primary dark:text-primary">
              GrowDo
            </h1>
            <p className="hidden sm:block text-sm text-muted-foreground mt-1">
              습관을 만들고 목표를 달성하세요!
            </p>
          </div>

          {/* 데스크톱 메뉴 */}
          <div className="hidden lg:flex items-center gap-4">
            {!isAdminPage && (
              <div className="flex gap-2 bg-muted p-1 rounded-lg">
                <Button
                  onClick={() => onTabChange('tasks')}
                  variant={mainTab === 'tasks' ? 'default' : 'ghost'}
                  className={`transition-all duration-300 active:scale-95 ${
                    mainTab === 'tasks' ? 'scale-105' : 'hover:scale-105'
                  }`}
                >
                  작업
                </Button>
                <Button
                  onClick={() => onTabChange('challenges')}
                  variant={mainTab === 'challenges' ? 'default' : 'ghost'}
                  className={`transition-all duration-300 active:scale-95 ${
                    mainTab === 'challenges' ? 'scale-105' : 'hover:scale-105'
                  }`}
                >
                  도전과제
                </Button>
                <Button
                  onClick={() => onTabChange('rewards')}
                  variant={mainTab === 'rewards' ? 'default' : 'ghost'}
                  className={`transition-all duration-300 active:scale-95 ${
                    mainTab === 'rewards' ? 'scale-105' : 'hover:scale-105'
                  }`}
                >
                  보상
                </Button>
              </div>
            )}

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                {user?.role === 'ADMIN' && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-primary/30 text-primary hover:bg-primary/5 hover:text-white"
                  >
                    <Link href={isAdminPage ? '/' : '/admin'}>
                      {isAdminPage ? '메인' : '관리자'}
                    </Link>
                  </Button>
                )}
                <Badge variant="secondary" className="text-sm">
                  <span className="font-semibold text-primary">{user?.username || '사용자'}</span>님
                  어서오세요
                </Badge>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  로그아웃
                </Button>
              </div>
            ) : (
              <Button asChild size="sm">
                <Link href="/login">로그인</Link>
              </Button>
            )}

            <ThemeToggleStandalone />
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggleStandalone />
            <Button
              onClick={onMobileMenuToggle}
              variant="outline"
              size="sm"
              className="p-2"
              aria-label="메뉴"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-border animate-slide-in">
            <div className="space-y-2">
              {!isAdminPage && (
                <>
                  <Button
                    onClick={() => handleMobileTabClick('tasks')}
                    variant={mainTab === 'tasks' ? 'default' : 'ghost'}
                    className={`w-full justify-start transition-all duration-300 active:scale-95 ${
                      mainTab === 'tasks' ? 'scale-105' : 'hover:scale-105'
                    }`}
                  >
                    작업
                  </Button>
                  <Button
                    onClick={() => handleMobileTabClick('challenges')}
                    variant={mainTab === 'challenges' ? 'default' : 'ghost'}
                    className={`w-full justify-start transition-all duration-300 active:scale-95 ${
                      mainTab === 'challenges' ? 'scale-105' : 'hover:scale-105'
                    }`}
                  >
                    도전과제
                  </Button>
                  <Button
                    onClick={() => handleMobileTabClick('rewards')}
                    variant={mainTab === 'rewards' ? 'default' : 'ghost'}
                    className={`w-full justify-start transition-all duration-300 active:scale-95 ${
                      mainTab === 'rewards' ? 'scale-105' : 'hover:scale-105'
                    }`}
                  >
                    보상
                  </Button>
                </>
              )}

              {isLoggedIn ? (
                <div className="pt-2 mt-2 border-t border-border space-y-2">
                  <Badge variant="secondary" className="mb-2 text-sm">
                    <span className="font-semibold text-primary">{user?.username || '사용자'}</span>
                    님 어서오세요
                  </Badge>
                  {user?.role === 'ADMIN' && (
                    <Button asChild variant="outline" className="w-full" size="sm">
                      <Link href={isAdminPage ? '/' : '/admin'}>
                        {isAdminPage ? '메인으로' : '관리자 페이지'}
                      </Link>
                    </Button>
                  )}
                  <Button onClick={handleLogout} variant="destructive" className="w-full" size="sm">
                    로그아웃
                  </Button>
                </div>
              ) : (
                <div className="pt-2 mt-2 border-t border-border">
                  <Button asChild className="w-full" size="sm">
                    <Link href="/login">로그인</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
