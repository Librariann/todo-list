'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import StatsPanel from './components/StatsPanel';
import RewardShop from './components/RewardShop';
import Header from './components/Header';
import NoticeBanner from './components/NoticeBanner';
import HomeHero from './components/home/HomeHero';
import TodayThemePicker from '@/app/components/home/TodayThemePicker';
import nightStyles from '@/app/components/home/NightObservatory.module.css';
import skinStyles from '@/app/components/home/TodaySkins.module.css';
import { ChevronDown } from 'lucide-react';
import ChallengesPanel from './components/home/ChallengesPanel';
import TaskTabs from './components/home/tasks/TaskTabs';
import TaskInsights from './components/home/tasks/TaskInsights';
import LoginPage from './login/page';
import type { MainTabType, TaskTabType } from './types/navigation';
import { formatDate, getTodayDateString } from './lib/dateUtils';
import { useTimeGreeting } from './hooks/useTimeGreeting';
import { TodayTheme, useTodayTheme } from '@/app/hooks/useTodayTheme';
import { useUserSummaryStore } from './store/userSummaryStore';
import { useCalendarStore } from './store/calendarStore';
import { useGoalsStore } from './store/goalsStore';
import { useHabitsStore } from './store/habitsStore';
import { useTodosStore } from './store/todosStore';
import { useChallengesStore } from './store/challengesStore';
import {
  consumeQueuedNativeNotification,
  subscribeToQueuedNativeNotification,
  type NativeNotificationDestination,
} from './lib/nativeBridge';
import HabitSection from './components/home/tasks/habits/HabitSection';
import GoalSection from './components/home/tasks/goal/GoalSection';
import TodoSection from './components/home/tasks/todo/TodoSection';
import GettingStartedGuide from './components/onboarding/GettingStartedGuide';
// import RecommendationsPanel from '@/app/components/home/RecommendationsPanel';
// import { RecommendationType, type Recommendation } from '@/app/types/recommendation';

export default function HomeWorkspace() {
  const isAuthenticated = useAuthStore((auth) => auth.isAuthenticated);
  const user = useAuthStore((auth) => auth.user);
  const [mounted, setMounted] = useState(false);
  const greeting = useTimeGreeting();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [mainTab, setMainTab] = useState<MainTabType>('tasks');
  const [taskTab, setTaskTab] = useState<TaskTabType>('habits');
  const { theme, selectTheme } = useTodayTheme(user?.id);
  const isNightTheme = theme === TodayTheme.Night;
  const isStudioTheme = theme === TodayTheme.Studio;
  const extraSkin = theme === TodayTheme.Coast || isStudioTheme;
  const skin = isNightTheme ? nightStyles : extraSkin ? skinStyles : undefined;
  const [createRequest, setCreateRequest] = useState<{
    type: TaskTabType;
    key: number;
  } | null>(null);
  const selectedDate = useCalendarStore((calendar) => calendar.selectedDate);
  const setSelectedDate = useCalendarStore((calendar) => calendar.setSelectedDate);
  const fetchSummary = useUserSummaryStore((state) => state.fetchSummary);
  const resetSummary = useUserSummaryStore((state) => state.resetSummary);
  const resetHabits = useHabitsStore((state) => state.resetHabits);
  const resetGoals = useGoalsStore((state) => state.resetGoals);
  const resetTodos = useTodosStore((state) => state.resetTodos);
  const resetChallenges = useChallengesStore((state) => state.resetChallenges);

  const handleOnboardingCreate = (type: TaskTabType) => {
    setMainTab('tasks');
    setTaskTab(type);
    setSelectedDate(getTodayDateString());
    setCreateRequest({ type, key: Date.now() });
    window.requestAnimationFrame(() => {
      document.getElementById('task-workspace')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  /*
  const handleRecommendationAccepted = (recommendation: Recommendation): void => {
    const tabByType: Record<RecommendationType, TaskTabType> = {
      [RecommendationType.TODO]: 'todos',
      [RecommendationType.HABIT]: 'habits',
      [RecommendationType.GOAL]: 'goals',
    };
    setTaskTab(tabByType[recommendation.type]);
    setSelectedDate(
      recommendation.payload.targetDate ??
      recommendation.payload.startDate ??
      getTodayDateString()
    );
  };
  */

  useEffect(() => {
    const openNotificationDestination = (destination: NativeNotificationDestination) => {
      if (destination.date) setSelectedDate(destination.date);

      if (
        destination.screen === 'habits' ||
        destination.screen === 'todos' ||
        destination.screen === 'goals'
      ) {
        setMainTab('tasks');
        setTaskTab(destination.screen);
      } else {
        setMainTab(destination.screen);
      }

      window.requestAnimationFrame(() => {
        const targetId =
          destination.screen === 'challenges' || destination.screen === 'rewards'
            ? 'main-content'
            : 'task-workspace';
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };

    const queuedDestination = consumeQueuedNativeNotification();
    if (queuedDestination) openNotificationDestination(queuedDestination);
    const unsubscribe = subscribeToQueuedNativeNotification(openNotificationDestination);
    const handleNativeHome = () => {
      setMainTab('tasks');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('growdo:native-home', handleNativeHome);
    return () => {
      unsubscribe();
      window.removeEventListener('growdo:native-home', handleNativeHome);
    };
  }, [setSelectedDate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let today = getTodayDateString();
    let timer: number;
    const checkForNewDay = () => {
      window.clearTimeout(timer);
      const nextToday = getTodayDateString();
      if (nextToday !== today) {
        const calendar = useCalendarStore.getState();
        if (calendar.selectedDate === today) {
          calendar.setSelectedDate(nextToday);
        }
        today = nextToday;
        void useTodosStore.getState().fetchTodos(today).then(() => calendar.invalidateMarks());
      }

      const midnight = Date.parse(`${today}T00:00:00+09:00`) + 86_400_000;
      timer = window.setTimeout(checkForNewDay, Math.max(0, midnight - Date.now()) + 50);
    };

    checkForNewDay();
    window.addEventListener('focus', checkForNewDay);
    document.addEventListener('visibilitychange', checkForNewDay);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', checkForNewDay);
      document.removeEventListener('visibilitychange', checkForNewDay);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      resetSummary();
      resetHabits();
      resetGoals();
      resetTodos();
      resetChallenges();
      return;
    }

    void fetchSummary();
  }, [
    fetchSummary,
    isAuthenticated,
    resetChallenges,
    resetGoals,
    resetHabits,
    resetSummary,
    resetTodos,
  ]);

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

  const themePicker = mainTab === 'tasks' ? (
    <TodayThemePicker theme={theme} onThemeChange={selectTheme} />
  ) : null;

  return (
    <div data-workspace-skin={skin ? theme : undefined} className={`min-h-dvh bg-[#d9e1d5] pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] pt-2 pb-[calc(6rem+env(safe-area-inset-bottom))] dark:bg-background sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] sm:pt-6 xl:pb-[max(1.5rem,env(safe-area-inset-bottom))] ${skin?.shell ?? ''} ${extraSkin ? skinStyles.palette : ''}`}>
      <div className={`mx-auto max-w-[1500px] overflow-hidden rounded-[2rem] bg-card shadow-[0_24px_70px_rgba(38,48,42,0.12)] ${skin?.frame ?? ''}`}>
        <Header mainTab={mainTab} onTabChange={setMainTab} />
        <NoticeBanner />

        <main id="main-content" className="page-reveal">
          <div
            data-today-theme={skin ? theme : undefined}
            className={`overflow-hidden ${isNightTheme ? nightStyles.palette : ''} ${skin?.layout ?? (
              mainTab === 'tasks'
                ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]'
                : ''
            )}`}
          >
            <section data-workspace-part="workspace" className="@container/workspace order-1 min-w-0 bg-[#fbf8ef] text-[#26302a] dark:bg-card dark:text-foreground">
              <div className="overflow-hidden">
                <HomeHero
                  mainTab={mainTab}
                  selectedDateLabel={formatDate(selectedDate)}
                  greeting={greeting}
                  username={user?.username}
                  actions={themePicker}
                  theme={theme}
                  themeDate={selectedDate}
                />

                <div data-workspace-part="body" className="px-3 pt-5 pb-10 @min-[28rem]/workspace:px-6 @min-[48rem]/workspace:px-8 sm:pb-12">
                  {mainTab === 'tasks' ? (
                    <div id="task-workspace" data-workspace-part="notebook" className="@container/tasks min-w-0 scroll-mt-6">
                      <GettingStartedGuide
                        userId={user?.id}
                        onCreate={handleOnboardingCreate}
                      />
                      {/* 운영 추천 API가 준비될 때까지 추천 영역을 숨깁니다.
                      {user ? (
                        <RecommendationsPanel
                          key={user.id}
                          userId={user.id}
                          onAccepted={handleRecommendationAccepted}
                        />
                      ) : null}
                      */}
                      <div data-tour="task-tabs" data-workspace-part="index">
                        {skin ? <p aria-hidden="true">{isNightTheme ? '기록 색인' : isStudioTheme ? '트랙 목록' : '오늘의 산책길'}</p> : null}
                        <TaskTabs activeTab={taskTab} onChange={setTaskTab} numbered={isNightTheme || isStudioTheme} />
                      </div>

                      <div data-workspace-part="records" className="grid min-w-0 items-start gap-4 @min-[40rem]/tasks:grid-cols-[minmax(0,1fr)_17rem]">
                        <section data-workspace-part="sheet" className="@container/task-panel min-w-0 rounded-[1.75rem] bg-[#eef0e7] px-3 py-6 dark:bg-muted @min-[28rem]/tasks:px-5 @min-[40rem]/tasks:row-span-2">
                          {taskTab === 'habits' ? (
                            <HabitSection
                              createRequestKey={
                                createRequest?.type === 'habits' ? createRequest.key : undefined
                              }
                            />
                          ) : taskTab === 'goals' ? (
                            <GoalSection
                              createRequestKey={
                                createRequest?.type === 'goals' ? createRequest.key : undefined
                              }
                            />
                          ) : (
                            <TodoSection
                              createRequestKey={
                                createRequest?.type === 'todos' ? createRequest.key : undefined
                              }
                            />
                          )}
                        </section>

                        <div data-tour="task-insights" className="@container/insights min-w-0">
                          <TaskInsights activeTab={taskTab} />
                        </div>
                      </div>
                    </div>
                  ) : mainTab === 'challenges' ? (
                    <ChallengesPanel />
                  ) : (
                    <RewardShop themeScope={skin ? { name: theme, paletteClassName: skin.palette } : undefined} />
                  )}
                </div>
              </div>
            </section>
            {mainTab === 'tasks' && skin ? (
              <details className={skin.summary}>
                <summary>
                  이번 주의 기록 요약
                  <ChevronDown aria-hidden="true" className="size-4" />
                </summary>
                <div data-workspace-part="summary-panel" className="bg-[#1b2b37] p-5 sm:p-8">
                  <StatsPanel />
                </div>
              </details>
            ) : mainTab === 'tasks' ? (
              <aside className="order-2 min-w-0 space-y-6 border-t border-white/12 bg-[#28342d] px-5 py-9 sm:px-8 sm:py-11 lg:border-l lg:border-t-0 lg:px-6">
                <StatsPanel />
              </aside>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
