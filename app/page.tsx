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
import { Habit, Goal, Challenge } from './types/todo';
import { fetchUserChallengeProgress } from './lib/challengesApi';
import LoginPage from './login/page';
import type { MainTabType, TaskTabType } from './types/navigation';
import { formatDate } from './lib/dateUtils';
import { useTimeGreeting } from './hooks/useTimeGreeting';
import type { ChallengeItem, RewardItem, UserSummaryResponse } from './types/common';
import { fetchUserSummary } from './lib/usersApi';
import { useUserSummaryStore } from './store/userSummaryStore';
import { useCalendarStore } from './store/calendarStore';
import HabitSection from './components/home/tasks/habits/HabitSection';
import GoalSection from './components/home/tasks/goal/GoalSection';
import TodoSection from './components/home/tasks/todo/TodoSection';

type UserSummaryType = {
  points: number;
  rewards: RewardItem[];
  achievedChallenges: ChallengeItem[];
};

function mapUserSummary(data: UserSummaryResponse): UserSummaryType {
  return {
    points: typeof data.points === 'number' ? data.points : 0,
    rewards: (data.rewards ?? []).slice(0, 5),
    achievedChallenges: (data.achievedChallenges ?? []).slice(0, 5).map((challenge) => ({
      ...challenge,
      isActive: challenge.active,
      achievedAt: challenge.achievedAt ?? challenge.periodKey,
    })),
  };
}

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const greeting = useTimeGreeting();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 상태 관리
  const [loading, setLoading] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [mainTab, setMainTab] = useState<MainTabType>('tasks');
  const [taskTab, setTaskTab] = useState<TaskTabType>('habits');
  const selectedDate = useCalendarStore((calendar) => calendar.selectedDate);
  const setSelectedDate = useCalendarStore((calendar) => calendar.setSelectedDate);
  const currentMonth = useCalendarStore((calendar) => calendar.currentMonth);
  const setCurrentMonth = useCalendarStore((calendar) => calendar.setCurrentMonth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [apiChallenges, setApiChallenges] = useState<Challenge[]>([]);
  const [userSummary, setUserSummary] = useState<UserSummaryType>({
    points: 0,
    rewards: [],
    achievedChallenges: [],
  });
  const points = useUserSummaryStore((state) => state.points);
  const rewardsStore = useUserSummaryStore((state) => state.rewards);
  const achievedChallenges = useUserSummaryStore((state) => state.achievedChallenges);
  const isSummaryLoading = useUserSummaryStore((state) => state.isLoading);
  const fetchSummary = useUserSummaryStore((state) => state.fetchSummary);
  const resetSummary = useUserSummaryStore((state) => state.resetSummary);

  useEffect(() => {
    if (!isAuthenticated) {
      resetSummary();
      return;
    }

    void fetchSummary();
  }, [isAuthenticated, fetchSummary, resetSummary]);
  useEffect(() => {
    console.log({
      points,
      rewardsStore,
      achievedChallenges,
      isSummaryLoading,
    });
  }, [points, rewardsStore, achievedChallenges, isSummaryLoading]);

  // 사용자 요약 정보
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        setUserSummary(mapUserSummary(await fetchUserSummary()));
      } catch {
        // 네트워크 오류 시 빈 목록 유지
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isAuthenticated]);

  // // 달력 월 변경 시 해당 월 전체의 완료된 할일 날짜를 미리 fetch
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     return;
  //   }
  //   const year = currentMonth.getFullYear();
  //   const month = currentMonth.getMonth() + 1;
  //   fetchCompletedDatesInMonth(year, month)
  //     .then((completedInMonth) => {
  //       setCompletedTodoDates((prev) => {
  //         const next = new Set(prev);
  //         // 해당 월의 기존 날짜를 초기화한 뒤 새 결과로 교체
  //         const prefix = `${year}-${String(month).padStart(2, '0')}-`;
  //         prev.forEach((date) => {
  //           if (date.startsWith(prefix)) next.delete(date);
  //         });
  //         completedInMonth.forEach((d) => next.add(d));
  //         return next;
  //       });
  //     })
  //     .catch((err) => console.error('월별 완료 날짜 로드 실패:', err));
  // }, [isAuthenticated, currentMonth]);

  // // 데이터가 있는 날짜들 (달력에 점 표시용)
  // const markedDates = useMemo<string[]>(() => {
  //   const dates = new Set<string>();

  //   if (taskTab === 'goals') {
  //     goals.forEach((daily) => {
  //       daily.completedDates.forEach((date) => dates.add(date));
  //     });
  //   } else if (taskTab === 'todos') {
  //     completedTodoDates.forEach((date) => dates.add(date));
  //   }

  //   return Array.from(dates);
  // }, [taskTab, goals, completedTodoDates]);

  // const handleDeleteTodo = async (todoId: string) => {
  //   const snapshot = todos;
  //   const afterDelete = todos.filter((t) => t.id !== todoId);
  //   setTodos(afterDelete);
  //   // 삭제 후 완료된 할일 없으면 달력 점 제거
  //   setCompletedTodoDates((prev) => {
  //     const next = new Set(prev);
  //     const hasDoneAfter = afterDelete.some((t) => t.status === TodoStatus.DONE);
  //     if (!hasDoneAfter) {
  //       next.delete(selectedDate);
  //     }
  //     return next;
  //   });
  //   try {
  //     await deleteTodo(todoId);
  //   } catch {
  //     setTodos(snapshot);
  //     // 롤백 시 원래 상태 복원
  //     setCompletedTodoDates((prev) => {
  //       const next = new Set(prev);
  //       const hadDone = snapshot.some((snapshot) => snapshot.status === TodoStatus.DONE);
  //       if (hadDone) {
  //         next.add(selectedDate);
  //       } else {
  //         next.delete(selectedDate);
  //       }
  //       return next;
  //     });
  //   }
  // };

  // const progressMetrics = useMemo(() => {
  //   return calculateProgressMetrics(habits, goals, todos, selectedDate);
  // }, [habits, goals, todos, selectedDate]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    async function updateProgress() {
      const userChallengeData = await fetchUserChallengeProgress();
      setApiChallenges(userChallengeData);
    }

    updateProgress();
  }, [isAuthenticated, mainTab]);

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

  const completedToday = 0;
  // progressMetrics.habitsCompletedToday +
  // progressMetrics.goalsCompletedToday +
  // progressMetrics.todosCompletedToday;

  const totalToday = 0;
  // progressMetrics.totalHabitsToday +
  // progressMetrics.totalGoalsToday +
  // progressMetrics.totalTodosToday;

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
                <StatsPanel
                  loading={loading}
                  habits={habits}
                  goals={goals}
                  // completedTodoDates={completedTodoDates}
                  // metrics={progressMetrics}
                />
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

                        <TaskInsights
                          activeTab={taskTab}
                          completedToday={completedToday}
                          totalToday={totalToday}
                          userPoints={userSummary.points}
                          // progressMetrics={progressMetrics}
                          selectedDate={selectedDate}
                          // markedDates={markedDates}
                          currentMonth={currentMonth}
                          onMonthChange={setCurrentMonth}
                        />
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
