'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import StatsPanel from './components/StatsPanel';
import RewardShop from './components/RewardShop';
import Header from './components/Header';
import HomeHero from './components/home/HomeHero';
import ChallengesPanel from './components/home/ChallengesPanel';
import TaskTabs from './components/home/tasks/TaskTabs';
import TaskInsights from './components/home/tasks/TaskInsights';
import LoginPage from './login/page';
import type { MainTabType, TaskTabType } from './types/navigation';
import { formatDate } from './lib/dateUtils';
import { useTimeGreeting } from './hooks/useTimeGreeting';
import { useUserSummaryStore } from './store/userSummaryStore';
import { useCalendarStore } from './store/calendarStore';
import { useGoalsStore } from './store/goalsStore';
import { useHabitsStore } from './store/habitsStore';
import { useTodosStore } from './store/todosStore';
import HabitSection from './components/home/tasks/habits/HabitSection';
import GoalSection from './components/home/tasks/goal/GoalSection';
import TodoSection from './components/home/tasks/todo/TodoSection';

export default function Home() {
  const isAuthenticated = useAuthStore((auth) => auth.isAuthenticated);
  const user = useAuthStore((auth) => auth.user);
  const [mounted, setMounted] = useState(false);
  const greeting = useTimeGreeting();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [mainTab, setMainTab] = useState<MainTabType>('tasks');
  const [taskTab, setTaskTab] = useState<TaskTabType>('habits');
  const selectedDate = useCalendarStore((calendar) => calendar.selectedDate);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fetchSummary = useUserSummaryStore((state) => state.fetchSummary);
  const resetSummary = useUserSummaryStore((state) => state.resetSummary);
  const resetHabits = useHabitsStore((state) => state.resetHabits);
  const resetGoals = useGoalsStore((state) => state.resetGoals);
  const resetTodos = useTodosStore((state) => state.resetTodos);

  useEffect(() => {
    if (!isAuthenticated) {
      resetSummary();
      resetHabits();
      resetGoals();
      resetTodos();
      return;
    }

    void fetchSummary();
  }, [fetchSummary, isAuthenticated, resetGoals, resetHabits, resetSummary, resetTodos]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#d9e1d5] px-3 pt-3 pb-24 dark:bg-background sm:px-6 sm:pt-6 md:pb-6">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[2rem] bg-card shadow-[0_24px_70px_rgba(38,48,42,0.12)]">
        <Header
          mainTab={mainTab}
          onTabChange={setMainTab}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main id="main-content" className="page-reveal">
          <div
            className={`overflow-hidden ${
              mainTab === 'tasks'
                ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1.38fr)_minmax(20rem,0.62fr)]'
                : ''
            }`}
          >
            {mainTab === 'tasks' ? (
              <aside className="order-2 space-y-6 border-t border-white/12 bg-[#28342d] px-6 py-9 sm:px-9 sm:py-11 lg:border-l lg:border-t-0 lg:px-10">
                <StatsPanel />
              </aside>
            ) : null}

            <section className="order-1 min-w-0 bg-[#fbf8ef] text-[#26302a] dark:bg-card dark:text-foreground">
              <div className="overflow-hidden">
                <HomeHero
                  mainTab={mainTab}
                  selectedDateLabel={formatDate(selectedDate)}
                  greeting={greeting}
                  username={user?.username}
                />

                <div className="px-5 pt-5 pb-10 sm:px-10 sm:pb-12 lg:px-12">
                  {mainTab === 'tasks' ? (
                    <div>
                      <TaskTabs activeTab={taskTab} onChange={setTaskTab} />

                      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(17rem,0.7fr)]">
                        <section className="rounded-[1.75rem] bg-[#eef0e7] px-5 py-6 dark:bg-muted sm:px-7 sm:py-7 xl:row-span-2">
                          {taskTab === 'habits' ? (
                            <HabitSection />
                          ) : taskTab === 'goals' ? (
                            <GoalSection />
                          ) : (
                            <TodoSection />
                          )}
                        </section>

                        <TaskInsights activeTab={taskTab} />
                      </div>
                    </div>
                  ) : mainTab === 'challenges' ? (
                    <ChallengesPanel />
                  ) : (
                    <RewardShop />
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
