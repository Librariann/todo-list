"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThemeToggleStandalone from "./ThemeToggleStandalone";
import { useAuthStore } from "../store/authStore";
import { Menu, X } from "lucide-react";

type MainTabType = "tasks" | "rewards" | "challenges";

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
  const { data: session } = useSession();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  
  const isLoggedIn = session || isAuthenticated;

  const handleMobileTabClick = (tab: MainTabType) => {
    onTabChange(tab);
    onMobileMenuToggle();
  };

  const handleLogout = async () => {
    try {
      if (session) {
        await signOut({ callbackUrl: '/login' });
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
        clearAuth();
        router.push("/login");
      }
    } catch (error) {
      console.error("로그아웃 오류:", error);
      clearAuth();
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-700 to-indigo-600 dark:from-slate-300 dark:to-indigo-400 bg-clip-text text-transparent">
              ✨ Todo Master
            </h1>
            <p className="hidden sm:block text-sm text-muted-foreground mt-1">
              습관을 만들고 목표를 달성하세요!
            </p>
          </div>

          {/* 데스크톱 메뉴 */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex gap-2 bg-muted p-1 rounded-lg">
              <Button
                onClick={() => onTabChange("tasks")}
                variant={mainTab === "tasks" ? "default" : "ghost"}
                className={`transition-all duration-300 active:scale-95 ${
                  mainTab === "tasks" ? "scale-105" : "hover:scale-105"
                }`}
              >
                📝 작업
              </Button>
              <Button
                onClick={() => onTabChange("challenges")}
                variant={mainTab === "challenges" ? "default" : "ghost"}
                className={`transition-all duration-300 active:scale-95 ${
                  mainTab === "challenges" ? "scale-105" : "hover:scale-105"
                }`}
              >
                🏆 도전과제
              </Button>
              <Button
                onClick={() => onTabChange("rewards")}
                variant={mainTab === "rewards" ? "default" : "ghost"}
                className={`transition-all duration-300 active:scale-95 ${
                  mainTab === "rewards" ? "scale-105" : "hover:scale-105"
                }`}
              >
                🎁 보상
              </Button>
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-sm">
                  <span className="font-semibold text-primary">
                    {session?.user?.name || user?.username || '사용자'}
                  </span>
                  님 어서오세요
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
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-border animate-slide-in">
            <div className="space-y-2">
              <Button
                onClick={() => handleMobileTabClick("tasks")}
                variant={mainTab === "tasks" ? "default" : "ghost"}
                className={`w-full justify-start transition-all duration-300 active:scale-95 ${
                  mainTab === "tasks" ? "scale-105" : "hover:scale-105"
                }`}
              >
                📝 작업
              </Button>
              <Button
                onClick={() => handleMobileTabClick("challenges")}
                variant={mainTab === "challenges" ? "default" : "ghost"}
                className={`w-full justify-start transition-all duration-300 active:scale-95 ${
                  mainTab === "challenges" ? "scale-105" : "hover:scale-105"
                }`}
              >
                🏆 도전과제
              </Button>
              <Button
                onClick={() => handleMobileTabClick("rewards")}
                variant={mainTab === "rewards" ? "default" : "ghost"}
                className={`w-full justify-start transition-all duration-300 active:scale-95 ${
                  mainTab === "rewards" ? "scale-105" : "hover:scale-105"
                }`}
              >
                🎁 보상
              </Button>

              {isLoggedIn ? (
                <div className="pt-2 mt-2 border-t border-border">
                  <Badge variant="secondary" className="mb-2 text-sm">
                    <span className="font-semibold text-primary">
                      {session?.user?.name || user?.username || '사용자'}
                    </span>
                    님 어서오세요
                  </Badge>
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="w-full"
                    size="sm"
                  >
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
