"use client";

import Link from "next/link";
import ThemeToggleStandalone from "./ThemeToggleStandalone";

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
  const handleMobileTabClick = (tab: MainTabType) => {
    onTabChange(tab);
    onMobileMenuToggle();
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-700 to-indigo-600 dark:from-slate-300 dark:to-indigo-400 bg-clip-text text-transparent">
              ✨ Todo Master
            </h1>
            <p className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 mt-1">
              습관을 만들고 목표를 달성하세요!
            </p>
          </div>

          {/* 데스크톱 메뉴 */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => onTabChange("tasks")}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 cursor-pointer active:scale-95 ${
                  mainTab === "tasks"
                    ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm scale-105"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:scale-105"
                }`}
              >
                📝 작업
              </button>
              <button
                onClick={() => onTabChange("challenges")}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 cursor-pointer active:scale-95 ${
                  mainTab === "challenges"
                    ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm scale-105"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:scale-105"
                }`}
              >
                🏆 도전과제
              </button>
              <button
                onClick={() => onTabChange("rewards")}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 cursor-pointer active:scale-95 ${
                  mainTab === "rewards"
                    ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm scale-105"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:scale-105"
                }`}
              >
                🎁 보상
              </button>
            </div>

            <div className="flex gap-2">
              <Link href="/login">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
                  로그인
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer">
                  회원가입
                </button>
              </Link>
            </div>

            <ThemeToggleStandalone />
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggleStandalone />
            <button
              onClick={onMobileMenuToggle}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="메뉴"
            >
              <svg
                className="w-6 h-6 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-slide-in">
            <div className="space-y-2">
              <button
                onClick={() => handleMobileTabClick("tasks")}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 active:scale-95 ${
                  mainTab === "tasks"
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 scale-105"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
                }`}
              >
                📝 작업
              </button>
              <button
                onClick={() => handleMobileTabClick("challenges")}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 active:scale-95 ${
                  mainTab === "challenges"
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 scale-105"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
                }`}
              >
                🏆 도전과제
              </button>
              <button
                onClick={() => handleMobileTabClick("rewards")}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 active:scale-95 ${
                  mainTab === "rewards"
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 scale-105"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
                }`}
              >
                🎁 보상
              </button>

              <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <Link href="/login" className="flex-1">
                  <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    로그인
                  </button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <button className="w-full px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm">
                    회원가입
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
