'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { toast } from 'sonner';
import { updateHabitProgress } from './lib/habitUtils';
import { calculateProgressMetrics } from './lib/rewardUtils';
import HabitCard from './components/HabitCard';
import GoalCard from './components/GoalCard';
import SimpleTodoCard from './components/SimpleTodoCard';
import StatsPanel, { type ChallengeItem, type RewardItem } from './components/StatsPanel';
import RewardShop from './components/RewardShop';

import AddTaskModal from './components/AddTaskModal';
import Calendar from './components/Calendar';
import Header from './components/Header';
import {
  Todo,
  TodoStatus,
  Habit,
  Goal,
  Reward,
  ChallengeType,
  Challenge,
  TaskType,
} from './types/todo';
import { fetchHabits, createHabit, incrementHabit, decrementHabit } from './lib/habitsApi';
import { fetchRewards, redeemReward } from './lib/rewardsApi';
import { fetchUserChallengeProgress } from './lib/challengesApi';
import { fetchGoalsWithProgress, achieveGoal, createGoal } from './lib/goalsApi';
import {
  fetchTodos,
  createTodo,
  updateTodoStatus,
  deleteTodo,
  fetchCompletedDatesInMonth,
} from './lib/todosApi';
import { apiFetch } from './lib/apiClient';
import ChallengeComponent from './user/header/challenges/ChallengeComponent';
import LoginPage from './login/page';
import { Plus } from 'lucide-react';

type TaskTabType = 'home' | 'habits' | 'goals' | 'todos';
type MainTabType = 'tasks' | 'rewards' | 'challenges';
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type SummaryChallengeResponse = Omit<ChallengeItem, 'isActive' | 'achievedAt'> & {
  active: boolean;
  achievedAt?: string;
};

interface UserSummaryResponse {
  points: number;
  rewards?: RewardItem[];
  achievedChallenges?: SummaryChallengeResponse[];
}

interface UserSummaryState {
  points: number;
  rewards: RewardItem[];
  achievedChallenges: ChallengeItem[];
}

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 상태 관리
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [mainTab, setMainTab] = useState<MainTabType>('tasks');
  const [taskTab, setTaskTab] = useState<TaskTabType>('habits');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTaskType, setModalTaskType] = useState<TaskType>(TaskType.HABIT);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [apiChallenges, setApiChallenges] = useState<Challenge[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [habitsLoading, setHabitsLoading] = useState(false);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [todosLoading, setTodosLoading] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [userSummary, setUserSummary] = useState<UserSummaryState>({
    points: 0,
    rewards: [],
    achievedChallenges: [],
  });
  const [statsLoading, setStatsLoading] = useState(false);

  const [completedTodoDates, setCompletedTodoDates] = useState<Set<string>>(new Set());

  // 사용자 요약 정보
  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchData() {
      setStatsLoading(true);
      try {
        const res = await apiFetch(`${API_URL}/api/user/summary/`);
        if (!res.ok) return;

        const json = await res.json();
        const data = (json.data ?? {}) as UserSummaryResponse;

        setUserSummary({
          points: typeof data.points === 'number' ? data.points : 0,
          rewards: (data.rewards ?? []).slice(0, 5),
          achievedChallenges: (data.achievedChallenges ?? []).slice(0, 5).map((challenge) => ({
            ...challenge,
            isActive: challenge.active,
            achievedAt: challenge.achievedAt ?? challenge.periodKey,
          })),
        });
      } catch {
        // 네트워크 오류 시 빈 목록 유지
      } finally {
        setStatsLoading(false);
      }
    }

    fetchData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setChallengesLoading(true);
    fetchUserChallengeProgress()
      .then((data) => {
        setApiChallenges(data);
      })
      .catch((err) => console.error('도전과제 로드 실패:', err))
      .finally(() => setChallengesLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setGoalsLoading(true);
    fetchGoalsWithProgress()
      .then((data) => {
        setGoals(data);
      })
      .catch((err) => console.error('목표 로드 실패:', err))
      .finally(() => setGoalsLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setHabitsLoading(true);
    fetchHabits()
      .then((data) => setHabits(data))
      .catch((err) => console.error('습관 로드 실패:', err))
      .finally(() => setHabitsLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setRewardsLoading(true);
    fetchRewards()
      .then((data) => setRewards(data))
      .catch((err) => console.error('보상 로드 실패:', err))
      .finally(() => setRewardsLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setTodosLoading(true);
    fetchTodos(selectedDate)
      .then((data) => {
        setTodos(data);
        const hasDone = data.some((t) => t.status === TodoStatus.DONE);
        setCompletedTodoDates((prev) => {
          const next = new Set(prev);
          if (hasDone) next.add(selectedDate);
          else next.delete(selectedDate);
          return next;
        });
      })
      .catch((err) => console.error('할일 로드 실패:', err))
      .finally(() => setTodosLoading(false));
  }, [isAuthenticated, selectedDate]);

  // 달력 월 변경 시 해당 월 전체의 완료된 할일 날짜를 미리 fetch
  useEffect(() => {
    if (!isAuthenticated) return;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    fetchCompletedDatesInMonth(year, month)
      .then((completedInMonth) => {
        setCompletedTodoDates((prev) => {
          const next = new Set(prev);
          // 해당 월의 기존 날짜를 초기화한 뒤 새 결과로 교체
          const prefix = `${year}-${String(month).padStart(2, '0')}-`;
          prev.forEach((date) => {
            if (date.startsWith(prefix)) next.delete(date);
          });
          completedInMonth.forEach((d) => next.add(d));
          return next;
        });
      })
      .catch((err) => console.error('월별 완료 날짜 로드 실패:', err));
  }, [isAuthenticated, currentMonth]);

  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return '오늘';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return '어제';
    } else {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}월 ${day}일`;
    }
  };

  // 데이터가 있는 날짜들 (달력에 점 표시용)
  const markedDates = useMemo(() => {
    const dates = new Set<string>();

    if (taskTab === 'goals') {
      goals.forEach((daily) => {
        daily.completedDates.forEach((date) => dates.add(date));
      });
    } else if (taskTab === 'todos') {
      completedTodoDates.forEach((date) => dates.add(date));
    }

    return Array.from(dates);
  }, [taskTab, goals, completedTodoDates]);

  // 선택된 날짜의 목표 (완료 여부 포함)
  const goalsWithCompletion = useMemo(() => {
    return goals.map((goal) => ({
      ...goal,
      completed: goal.completedDates.includes(selectedDate),
    }));
  }, [goals, selectedDate]);

  const handleHabitPositive = async (id: string) => {
    // 낙관적 업데이트
    setHabits((prev) => prev.map((h) => (h.id === id ? updateHabitProgress(h, 1) : h)));
    try {
      const updated = await incrementHabit(id);
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));

      //완료가 됐을때 summary 데이터 불러옴
      if (updated.dailyTarget === updated.positiveCount) {
        const res = await apiFetch(`${API_URL}/api/user/summary/`);
        if (!res.ok) return;

        const json = await res.json();
        const data = (json.data ?? {}) as UserSummaryResponse;
        setUserSummary((prev) => ({
          ...prev,
          points: data.points,
        }));
      }
    } catch {
      setHabits((prev) => prev.map((h) => (h.id === id ? updateHabitProgress(h, -1) : h)));
    }
  };

  const handleHabitNegative = async (id: string) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? updateHabitProgress(h, -1) : h)));
    try {
      const updated = await decrementHabit(id);
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
    } catch {
      setHabits((prev) => prev.map((h) => (h.id === id ? updateHabitProgress(h, 1) : h)));
    }
  };

  const handleGoalToggle = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const target = goals.find((d) => d.id === id);
    if (!target) return;
    const isCompleted = target.completedDates.includes(today);
    if (isCompleted) return;

    setGoals((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        return { ...d, completedDates: [...d.completedDates, today] };
      })
    );
    try {
      await achieveGoal(id);
      toast.success('목표가 완료됐어요', {
        description: '완료된 목표는 취소할 수 없어요.',
      });
    } catch {
      setGoals((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, completedDates: d.completedDates.filter((dt) => dt !== today) } : d
        )
      );
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleTodoStatusChange = async (todoId: string, newStatus: TodoStatus) => {
    const snapshot = [...todos];
    const target = snapshot.find((snapshot) => snapshot.id === todoId);

    if (!target) {
      return;
    }

    const optimistic = snapshot.map((snapshot) => {
      if (snapshot.id !== todoId) {
        return snapshot;
      }

      const result =
        newStatus === TodoStatus.DONE
          ? { ...snapshot, status: newStatus, completedAt: new Date() }
          : { ...snapshot, status: newStatus, completedAt: undefined };

      return result;
    });

    setTodos(optimistic);

    // 완료 상태 변경 시 달력 점 표시 업데이트
    setCompletedTodoDates((prev) => {
      const next = new Set(prev);
      const hasDoneAfter = optimistic.some((snapshot) => snapshot.status === TodoStatus.DONE);

      if (hasDoneAfter) {
        next.add(selectedDate);
      } else {
        next.delete(selectedDate);
      }

      return next;
    });

    try {
      await updateTodoStatus(todoId, newStatus);
    } catch {
      setTodos(snapshot);

      // 롤백 시 completedTodoDates도 원래대로
      setCompletedTodoDates((prev) => {
        const next = new Set(prev);
        const hadDone = snapshot.some((snapshot) => snapshot.status === TodoStatus.DONE);
        if (hadDone) {
          next.add(selectedDate);
        } else {
          next.delete(selectedDate);
        }
        return next;
      });
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    const snapshot = todos;
    const afterDelete = todos.filter((t) => t.id !== todoId);
    setTodos(afterDelete);
    // 삭제 후 완료된 할일 없으면 달력 점 제거
    setCompletedTodoDates((prev) => {
      const next = new Set(prev);
      const hasDoneAfter = afterDelete.some((t) => t.status === TodoStatus.DONE);
      if (!hasDoneAfter) {
        next.delete(selectedDate);
      }
      return next;
    });
    try {
      await deleteTodo(todoId);
    } catch {
      setTodos(snapshot);
      // 롤백 시 원래 상태 복원
      setCompletedTodoDates((prev) => {
        const next = new Set(prev);
        const hadDone = snapshot.some((snapshot) => snapshot.status === TodoStatus.DONE);
        if (hadDone) {
          next.add(selectedDate);
        } else {
          next.delete(selectedDate);
        }
        return next;
      });
    }
  };

  // 보상 교환
  const handleClaimReward = async (reward: Reward) => {
    if (userSummary.points < reward.value) {
      toast.error('포인트가 부족합니다. 포인트를 모아주세요');
      return;
    }
    const prevSummary = userSummary;
    // 낙관적 UI 업데이트
    setUserSummary((prev) => ({
      ...prev,
      points: prev.points - reward.value,
    }));
    try {
      await redeemReward(reward.id);
      toast.success(`${reward.name}을(를) 획득했습니다!`);
    } catch {
      // 실패 시 롤백
      setUserSummary(prevSummary);
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 일일/주간/월간 도전과제 필터링 (API 데이터)
  const dailyChallenges = useMemo(
    () => apiChallenges.filter((c) => c.type === ChallengeType.DAILY),
    [apiChallenges]
  );

  const weeklyChallenges = useMemo(
    () => apiChallenges.filter((c) => c.type === ChallengeType.WEEKLY),
    [apiChallenges]
  );

  const monthlyChallenges = useMemo(
    () => apiChallenges.filter((c) => c.type === ChallengeType.MONTHLY),
    [apiChallenges]
  );

  const progressMetrics = useMemo(() => {
    return calculateProgressMetrics(habits, goals, todos, selectedDate);
  }, [habits, goals, todos, selectedDate]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후예요';
    return '오늘도 수고했어요';
  }, []);

  // 모달 열기
  const openAddModal = (type: TaskType) => {
    setModalTaskType(type);
    setIsModalOpen(true);
  };

  // 작업 추가
  const handleAddTask = async (task: Habit | Goal | Todo) => {
    if ('habitType' in task) {
      try {
        const created = await createHabit({
          name: task.title,
          dailyTarget: task.dailyTarget ?? 5,
        });
        setHabits((prev) => [...prev, created]);
      } catch (err) {
        console.error('습관 생성 실패:', err);
      }
    } else if ('frequency' in task) {
      const freqMap: Record<string, 'DAILY' | 'WEEKLY' | 'MONTHLY'> = {
        daily: 'DAILY',
        weekly: 'WEEKLY',
        monthly: 'MONTHLY',
      };
      const freq = freqMap[(task as Goal).frequency] ?? 'DAILY';
      try {
        const created = await createGoal(task.title, freq);
        setGoals((prev) => [...prev, created]);
      } catch (err) {
        console.error('목표 생성 실패:', err);
      }
    } else {
      try {
        const created = await createTodo((task as Todo).title, (task as Todo).date);
        setTodos((prev) => [...prev, created]);
      } catch (err) {
        console.error('할일 생성 실패:', err);
        toast.error(err instanceof Error ? err.message : '할 일을 생성하지 못했습니다.');
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

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

  const completedToday =
    progressMetrics.habitsCompletedToday +
    progressMetrics.goalsCompletedToday +
    progressMetrics.todosCompletedToday;
  const totalToday =
    progressMetrics.totalHabitsToday +
    progressMetrics.totalGoalsToday +
    progressMetrics.totalTodosToday;

  return (
    <div className="min-h-screen bg-[#d9e1d5] px-3 pt-3 pb-24 dark:bg-background sm:px-6 sm:pt-6 md:pb-6">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[2rem] bg-card shadow-[0_24px_70px_rgba(38,48,42,0.12)]">
        {/* 헤더 */}
        <Header
          mainTab={mainTab}
          onTabChange={setMainTab}
          taskTab={taskTab}
          onTaskTabChange={(tab) => {
            setTaskTab(tab);
            if (tab === 'home') setSelectedDate(new Date().toISOString().split('T')[0]);
          }}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* 메인 컨텐츠 */}
        <main id="main-content" className="page-reveal">
          <div
            className={`overflow-hidden ${
              mainTab === 'tasks'
                ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1.38fr)_minmax(20rem,0.62fr)]'
                : ''
            }`}
          >
            {/* 왼쪽: 통계 & 날짜 선택 */}
            {mainTab === 'tasks' && (
              <aside className="order-2 space-y-6 border-t border-white/12 bg-[#28342d] px-6 py-9 sm:px-9 sm:py-11 lg:border-l lg:border-t-0 lg:px-10">
                <StatsPanel
                  totalPoints={userSummary.points}
                  habits={habits}
                  goals={goals}
                  completedTodoDates={completedTodoDates}
                  metrics={progressMetrics}
                  loading={statsLoading}
                />

                {/* 날짜 선택 달력 (목표/할일 탭일 때만 표시) */}
              </aside>
            )}

            {/* 오른쪽: 컨텐츠 */}
            <section className="order-1 min-w-0 bg-[#fbf8ef] text-[#26302a] dark:bg-card dark:text-foreground">
              <div className="overflow-hidden">
                <div className="relative flex min-h-[17rem] flex-col justify-end gap-5 overflow-hidden px-5 pt-10 pb-5 sm:px-10 sm:pt-14 lg:px-12">
                  <div className="relative z-10">
                    <p className="mb-3 text-sm font-semibold text-[#2e8c54] dark:text-primary">
                      {mainTab === 'tasks' ? formatDate(selectedDate) : 'GrowDo'}
                    </p>
                    <h1 className="friendly-heading max-w-3xl whitespace-pre-line text-4xl font-normal leading-[1.18] tracking-[-0.06em] sm:text-6xl">
                      {mainTab === 'tasks'
                        ? `${greeting}, ${user?.username || '사용자'}님.\n오늘 머물 곳을 정리해뒀어요.`
                        : mainTab === 'challenges'
                          ? '이번 주도 가볍게 도전해요'
                          : '나를 위한 보상'}
                    </h1>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                      {mainTab === 'tasks'
                        ? '필요한 방부터 열어보고, 하나씩 가볍게 시작해요.'
                        : mainTab === 'challenges'
                          ? '평소 하던 일을 이어가면 자연스럽게 달성할 수 있어요.'
                          : '꾸준히 모은 포인트로 오늘의 작은 기쁨을 골라보세요.'}
                    </p>
                  </div>
                </div>

                <div className="px-5 pt-5 pb-10 sm:px-10 sm:pb-12 lg:px-12">
                  {mainTab === 'tasks' ? (
                    <div>
                      <nav
                        className="mb-5 grid grid-cols-3 overflow-hidden rounded-[1.35rem] border border-[#26302a]/12 bg-[#f4f1e8] dark:border-border dark:bg-muted"
                        aria-label="작업 공간"
                      >
                        {[
                          {
                            key: 'habits' as const,
                            label: '습관',
                            description: '매일 이어가는 행동',
                          },
                          {
                            key: 'todos' as const,
                            label: '할 일',
                            description: '오늘과 앞으로의 일',
                          },
                          {
                            key: 'goals' as const,
                            label: '목표',
                            description: '길게 보고 가는 방향',
                          },
                        ].map((item, index) => {
                          const active =
                            item.key === 'habits' ? taskTab === 'habits' : taskTab === item.key;

                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => {
                                setTaskTab(item.key);
                              }}
                              className={`relative min-h-[4.5rem] px-3 text-left transition-colors sm:min-h-20 sm:px-5 ${
                                index > 0 ? 'border-l border-[#26302a]/10 dark:border-border' : ''
                              } ${
                                active
                                  ? 'bg-[#e4eddf] text-[#216c40] dark:bg-secondary dark:text-primary'
                                  : 'text-[#687169] hover:bg-white/60 dark:text-muted-foreground dark:hover:bg-card'
                              }`}
                              aria-current={active ? 'page' : undefined}
                            >
                              <span className="block text-base font-bold sm:text-lg">
                                {item.label}
                              </span>
                              <span className="mt-1 hidden text-xs font-medium opacity-75 sm:block">
                                {item.description}
                              </span>
                              {active && (
                                <span className="absolute inset-x-4 bottom-0 h-1 rounded-t-full bg-[#2e8c54] dark:bg-primary" />
                              )}
                            </button>
                          );
                        })}
                      </nav>

                      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(17rem,0.7fr)]">
                        <section className="rounded-[1.75rem] bg-[#eef0e7] px-5 py-6 dark:bg-muted sm:px-7 sm:py-7 xl:row-span-2">
                          {/* 메인 룸: 작업 컨텐츠 */}
                          {taskTab === 'habits' && (
                            <div>
                              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <h2 className="friendly-heading text-2xl font-bold text-foreground">
                                    오늘의 습관
                                  </h2>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    이번 주도 잘 이어가고 있어요
                                  </p>
                                </div>
                                <button
                                  onClick={() => openAddModal(TaskType.HABIT)}
                                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                                  aria-label="습관 추가"
                                >
                                  <Plus className="h-5 w-5" />
                                </button>
                              </div>

                              <div className="space-y-3">
                                {habitsLoading ? (
                                  <div className="bg-card rounded-lg p-8 text-center border border-border">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                                    <p className="text-muted-foreground text-sm">습관 로딩 중...</p>
                                  </div>
                                ) : habits.length === 0 ? (
                                  <div className="bg-card rounded-lg p-8 text-center border border-border">
                                    <p className="font-medium text-foreground">
                                      아직 기록한 습관이 없어요.
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      매일 이어가고 싶은 작은 행동부터 적어보세요.
                                    </p>
                                  </div>
                                ) : (
                                  habits.map((habit) => (
                                    <HabitCard
                                      key={habit.id}
                                      habit={habit}
                                      onPositive={handleHabitPositive}
                                      onNegative={handleHabitNegative}
                                    />
                                  ))
                                )}
                              </div>
                            </div>
                          )}

                          {taskTab === 'goals' && (
                            <div>
                              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <h2 className="friendly-heading text-2xl font-bold text-foreground">
                                    {formatDate(selectedDate)}의 목표
                                  </h2>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    내가 정한 속도로 천천히 이어가요
                                  </p>
                                </div>
                                <button
                                  onClick={() => openAddModal(TaskType.GOAL)}
                                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                                  aria-label="목표 추가"
                                >
                                  <Plus className="h-5 w-5" />
                                </button>
                              </div>

                              <div className="space-y-3">
                                {goalsLoading ? (
                                  <div className="bg-card rounded-lg p-8 text-center border border-border">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                                    <p className="text-muted-foreground text-sm">목표 로딩 중...</p>
                                  </div>
                                ) : goalsWithCompletion.length === 0 ? (
                                  <div className="bg-card rounded-lg p-8 text-center border border-border">
                                    <p className="font-medium text-foreground">
                                      아직 적어둔 목표가 없어요.
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      이번 주에 꼭 지키고 싶은 한 가지를 남겨보세요.
                                    </p>
                                  </div>
                                ) : (
                                  goalsWithCompletion.map((goal) => (
                                    <GoalCard
                                      key={goal.id}
                                      goal={goal}
                                      onToggle={handleGoalToggle}
                                    />
                                  ))
                                )}
                              </div>
                            </div>
                          )}

                          {taskTab === 'todos' && (
                            <div>
                              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <h2 className="friendly-heading text-2xl font-bold text-foreground">
                                    {formatDate(selectedDate)}의 할 일
                                  </h2>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    오늘 필요한 일만 가볍게 적어보세요
                                  </p>
                                </div>
                                <button
                                  onClick={() => openAddModal(TaskType.TODO)}
                                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                                  aria-label="할 일 추가"
                                >
                                  <Plus className="h-5 w-5" />
                                </button>
                              </div>

                              <div className="space-y-3">
                                {todosLoading ? (
                                  <div className="bg-card rounded-lg p-8 text-center border border-border">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                                    <p className="text-muted-foreground text-sm">
                                      할 일 로딩 중...
                                    </p>
                                  </div>
                                ) : todos.length === 0 ? (
                                  <div className="bg-card rounded-lg p-8 text-center border border-border">
                                    <p className="font-medium text-foreground">
                                      오늘 페이지가 비어 있어요.
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      지금 끝내고 싶은 일을 한 줄로 적어보세요.
                                    </p>
                                  </div>
                                ) : (
                                  todos.map((todo, index) => (
                                    <SimpleTodoCard
                                      key={todo.id}
                                      todo={todo}
                                      featured={index === 0}
                                      onStatusChange={handleTodoStatusChange}
                                      onDelete={handleDeleteTodo}
                                    />
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </section>

                        <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                          <section className="rounded-[1.75rem] bg-[#f4d89e] p-6 text-[#3f3625] dark:bg-[oklch(0.45_0.08_75)] dark:text-foreground">
                            <p className="text-xs font-bold tracking-[0.16em] text-[#765f31] dark:text-foreground/70">
                              SUNNY CORNER
                            </p>
                            <p className="friendly-heading mt-8 text-4xl font-bold tracking-[-0.06em]">
                              {completedToday}개 완료
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[#6d5b37] dark:text-foreground/75">
                              {completedToday > 0
                                ? `오늘의 ${totalToday || completedToday}개 중 여기까지 잘 왔어요.`
                                : '첫 번째 일을 끝내면 오늘의 흐름이 시작돼요.'}
                            </p>
                          </section>

                          <section className="rounded-[1.75rem] bg-[#cfe6ed] p-6 text-[#294850] dark:bg-[oklch(0.4_0.055_225)] dark:text-foreground">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-xs font-bold tracking-[0.16em] text-[#3f6873] dark:text-foreground/70">
                                WINDOW VIEW
                              </p>
                              <span className="text-xs font-semibold">
                                {userSummary.points.toLocaleString()} P
                              </span>
                            </div>
                            {taskTab === 'goals' || taskTab === 'todos' ? (
                              <div className="mt-5 rounded-2xl bg-[#fbf8ef]/80 p-2 text-[#26302a] dark:bg-card dark:text-foreground">
                                <Calendar
                                  selectedDate={selectedDate}
                                  onDateSelect={handleDateSelect}
                                  markedDates={markedDates}
                                  currentMonth={currentMonth}
                                  onMonthChange={setCurrentMonth}
                                />
                              </div>
                            ) : (
                              <div className="mt-8">
                                <p className="friendly-heading text-3xl font-bold">
                                  오늘 +{progressMetrics.totalPointsEarned}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-[#4f6c73] dark:text-foreground/75">
                                  완료할 때마다 내일 다시 돌아올 이유가 쌓여요.
                                </p>
                              </div>
                            )}
                          </section>
                        </aside>
                      </div>
                    </div>
                  ) : mainTab === 'challenges' ? (
                    /* 도전과제 탭 */
                    <div>
                      {/* 일일 도전과제 */}
                      <ChallengeComponent
                        title="일일 도전과제"
                        challengeOptions={dailyChallenges}
                        comment={'매일 자정에 초기화됩니다'}
                        loading={challengesLoading}
                      />

                      {/* 주간 도전과제 */}
                      <ChallengeComponent
                        title="주간 도전과제"
                        challengeOptions={weeklyChallenges}
                        comment={'매주 월요일에 초기화됩니다'}
                        loading={challengesLoading}
                      />

                      {/* 월간 도전과제 */}
                      <ChallengeComponent
                        title="월간 도전과제"
                        challengeOptions={monthlyChallenges}
                        comment={'매달 1일에 초기화됩니다'}
                        loading={challengesLoading}
                      />
                    </div>
                  ) : (
                    /* 보상 탭 */
                    <RewardShop
                      rewards={rewardsLoading ? [] : rewards}
                      userPoints={userSummary.points}
                      onClaim={handleClaimReward}
                    />
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* 추가 모달 */}
        <AddTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          taskType={modalTaskType}
          onAdd={handleAddTask}
        />
      </div>
    </div>
  );
}
