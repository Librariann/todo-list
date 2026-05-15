'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuthStore } from './store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useDataPersistence } from './hooks/useDataPersistence';
import { updateHabitProgress } from './lib/habitUtils';
import { calculateProgressMetrics, calculateDailyPoints } from './lib/rewardUtils';
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
import { useThemeStore } from './store/themeStore';
import { THEME_NAME } from '@/lib/constant';
import ChallengeComponent from './user/header/challenges/ChallengeComponent';

type TaskTabType = 'habits' | 'goals' | 'todos';
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
  const { isDarkMode, setTheme } = useThemeStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [themeMode, setThemeMode] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (Boolean(localStorage.getItem(THEME_NAME))) {
      setThemeMode(localStorage.getItem(THEME_NAME));
    } else {
      localStorage.setItem(THEME_NAME, 'light');
      setThemeMode('light');
    }
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
        console.log(data);
      })
      .catch((err) => console.error('도전과제 로드 실패:', err))
      .finally(() => setChallengesLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setGoalsLoading(true);
    fetchGoalsWithProgress()
      .then((data) => setGoals(data))
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

      //완료가 됐을때 도전과제 달성도 데이터 불러옴
      if (updated.dailyTarget === updated.positiveCount) {
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
    const target = snapshot.find((t) => t.id === todoId);
    if (!target) return;
    const optimistic = snapshot.map((t) => {
      if (t.id !== todoId) return t;
      return newStatus === TodoStatus.DONE
        ? { ...t, status: newStatus, completedAt: new Date() }
        : { ...t, status: newStatus, completedAt: undefined };
    });
    setTodos(optimistic);
    // 완료 상태 변경 시 달력 점 표시 업데이트
    setCompletedTodoDates((prev) => {
      const next = new Set(prev);
      const hasDoneAfter = optimistic.some((t) => t.status === TodoStatus.DONE);
      if (hasDoneAfter) next.add(selectedDate);
      else next.delete(selectedDate);
      return next;
    });
    try {
      await updateTodoStatus(todoId, newStatus);
    } catch {
      setTodos(snapshot);
      // 롤백 시 completedTodoDates도 원래대로
      setCompletedTodoDates((prev) => {
        const next = new Set(prev);
        const hadDone = snapshot.some((t) => t.status === TodoStatus.DONE);
        if (hadDone) next.add(selectedDate);
        else next.delete(selectedDate);
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
      if (!hasDoneAfter) next.delete(selectedDate);
      return next;
    });
    try {
      await deleteTodo(todoId);
    } catch {
      setTodos(snapshot);
      // 롤백 시 원래 상태 복원
      setCompletedTodoDates((prev) => {
        const next = new Set(prev);
        const hadDone = snapshot.some((t) => t.status === TodoStatus.DONE);
        if (hadDone) next.add(selectedDate);
        else next.delete(selectedDate);
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

  const todayPoints = useMemo(() => {
    return calculateDailyPoints(habits, goals, todos, selectedDate);
  }, [habits, goals, todos, selectedDate]);

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
      }
    }
  };

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, mounted, router]);

  useEffect(() => {
    async function updateProgress() {
      const userChallengeData = await fetchUserChallengeProgress();
      setApiChallenges(userChallengeData);
    }

    updateProgress();
  }, [mainTab]);

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
    return null;
  }

  return (
    <div className={`min-h-screen bg-background `}>
      {/* 헤더 */}
      <Header
        mainTab={mainTab}
        onTabChange={setMainTab}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 왼쪽: 통계 & 날짜 선택 */}
          <div className="lg:col-span-1 space-y-6">
            <StatsPanel
              totalPoints={userSummary.points}
              rewards={userSummary.rewards}
              challenges={userSummary.achievedChallenges}
              loading={statsLoading}
            />

            {/* 날짜 선택 달력 (목표/할일 탭일 때만 표시) */}
            {mainTab === 'tasks' && (taskTab === 'goals' || taskTab === 'todos') && (
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                markedDates={markedDates}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
              />
            )}
          </div>

          {/* 오른쪽: 컨텐츠 */}
          <div className="lg:col-span-3">
            {mainTab === 'tasks' ? (
              <div>
                {/* 작업 카테고리 탭 */}
                <div className="mb-6 bg-card border border-border rounded-xl shadow-sm p-4">
                  <div className="flex justify-center gap-2 overflow-x-auto">
                    <button
                      onClick={() => setTaskTab('habits')}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        taskTab === 'habits'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/70'
                      }`}
                    >
                      습관
                    </button>
                    <button
                      onClick={() => setTaskTab('goals')}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        taskTab === 'goals'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/70'
                      }`}
                    >
                      목표
                    </button>
                    <button
                      onClick={() => setTaskTab('todos')}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        taskTab === 'todos'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/70'
                      }`}
                    >
                      할일
                    </button>
                  </div>
                </div>

                {/* 작업 컨텐츠 */}
                {taskTab === 'habits' && (
                  <div>
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                          습관 (Habits)
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          반복하고 싶은 긍정적 습관이나 줄이고 싶은 부정적 습관을 추적하세요
                        </p>
                      </div>
                      <button
                        onClick={() => openAddModal(TaskType.HABIT)}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <span className="text-xl">+</span>
                        <span>추가</span>
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
                          <p className="text-muted-foreground">습관이 없습니다</p>
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
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                          목표 ({formatDate(selectedDate)})
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          매일/매주/매월 반복되는 목표를 관리하세요
                        </p>
                      </div>
                      <button
                        onClick={() => openAddModal(TaskType.GOAL)}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <span className="text-xl">+</span>
                        <span>추가</span>
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
                          <p className="text-muted-foreground">목표가 없습니다</p>
                        </div>
                      ) : (
                        goalsWithCompletion.map((goal) => (
                          <GoalCard key={goal.id} goal={goal} onToggle={handleGoalToggle} />
                        ))
                      )}
                    </div>
                  </div>
                )}

                {taskTab === 'todos' && (
                  <div>
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                          할 일 ({formatDate(selectedDate)})
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          일회성 작업을 추가하고 완료하세요
                        </p>
                      </div>
                      <button
                        onClick={() => openAddModal(TaskType.TODO)}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <span className="text-xl">+</span>
                        <span>추가</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {todosLoading ? (
                        <div className="bg-card rounded-lg p-8 text-center border border-border">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                          <p className="text-muted-foreground text-sm">할일 로딩 중...</p>
                        </div>
                      ) : todos.length === 0 ? (
                        <div className="bg-card rounded-lg p-8 text-center border border-border">
                          <p className="text-muted-foreground">할 일이 없습니다</p>
                        </div>
                      ) : (
                        todos.map((todo) => (
                          <SimpleTodoCard
                            key={todo.id}
                            todo={todo}
                            onStatusChange={handleTodoStatusChange}
                            onDelete={handleDeleteTodo}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}
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
      </main>

      {/* 추가 모달 */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskType={modalTaskType}
        onAdd={handleAddTask}
      />
    </div>
  );
}
