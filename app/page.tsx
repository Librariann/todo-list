'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import HabitCard from './components/HabitCard';
import DailyCard from './components/DailyCard';
import SimpleTodoCard from './components/SimpleTodoCard';
import SimpleStatsCard from './components/SimpleStatsCard';
import RewardShop from './components/RewardShop';
import ChallengeCard from './components/ChallengeCard';
import ThemeToggleStandalone from './components/ThemeToggleStandalone';
import AddTaskModal from './components/AddTaskModal';
import Calendar from './components/Calendar';
import { Todo, TodoStatus, Habit, Daily, Reward, Challenge, ChallengeType, TaskType } from './types/todo';
import { mockHabits, mockDailies, mockTodos, mockUserStats, mockRewards, mockChallenges } from './lib/mockData';

type TaskTabType = 'habits' | 'dailies' | 'todos';
type MainTabType = 'tasks' | 'rewards' | 'challenges';

export default function Home() {
  // 상태 관리
  const [habits, setHabits] = useState<Habit[]>(mockHabits);
  const [dailies, setDailies] = useState<Daily[]>(mockDailies);
  const [todos, setTodos] = useState<Todo[]>(mockTodos);
  const [challenges, setChallenges] = useState<Challenge[]>(mockChallenges);
  const [userStats, setUserStats] = useState(mockUserStats);
  const [mainTab, setMainTab] = useState<MainTabType>('tasks');
  const [taskTab, setTaskTab] = useState<TaskTabType>('habits');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTaskType, setModalTaskType] = useState<TaskType>(TaskType.HABIT);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());



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
    
    if (taskTab === 'dailies') {
      dailies.forEach(daily => {
        daily.completedDates.forEach(date => dates.add(date));
      });
    } else if (taskTab === 'todos') {
      todos.forEach(todo => dates.add(todo.date));
    }
    
    return Array.from(dates);
  }, [taskTab, dailies, todos]);

  // 선택된 날짜의 일일 목표 (완료 여부 포함)
  const dailiesWithCompletion = useMemo(() => {
    return dailies.map(daily => ({
      ...daily,
      completed: daily.completedDates.includes(selectedDate),
    }));
  }, [dailies, selectedDate]);

  // 선택된 날짜의 할 일
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => todo.date === selectedDate);
  }, [todos, selectedDate]);

  // 습관 +/- 처리 (포인트 없이 카운트만 증가)
  const handleHabitPositive = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        return { ...h, positiveCount: h.positiveCount + 1 };
      }
      return h;
    }));
  };

  const handleHabitNegative = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        return { ...h, negativeCount: h.negativeCount + 1 };
      }
      return h;
    }));
  };

  // 일일 목표 토글 (포인트 없이 완료 상태만 변경)
  const handleDailyToggle = (id: string) => {
    setDailies(prev => prev.map(d => {
      if (d.id === id) {
        const isCompleted = d.completedDates.includes(selectedDate);
        let newCompletedDates = [...d.completedDates];
        
        if (isCompleted) {
          // 완료 취소
          newCompletedDates = newCompletedDates.filter(date => date !== selectedDate);
        } else {
          // 완료 추가
          newCompletedDates.push(selectedDate);
        }

        return {
          ...d,
          completedDates: newCompletedDates,
        };
      }
      return d;
    }));
  };

  // 할 일 상태 변경 (포인트 없이 상태만 변경)
  const handleTodoStatusChange = (todoId: string, newStatus: TodoStatus) => {
    setTodos(prev => prev.map(todo => {
      if (todo.id === todoId) {
        const wasCompleted = todo.status === TodoStatus.DONE;
        const isNowCompleted = newStatus === TodoStatus.DONE;

        if (!wasCompleted && isNowCompleted) {
          return { ...todo, status: newStatus, completedAt: new Date() };
        } else if (wasCompleted && !isNowCompleted) {
          return { ...todo, status: newStatus, completedAt: undefined };
        }

        return { ...todo, status: newStatus };
      }
      return todo;
    }));
  };

  // 보상 교환
  const handleClaimReward = (reward: Reward) => {
    if (userStats.totalPoints >= reward.value) {
      setUserStats(prev => ({
        ...prev,
        totalPoints: prev.totalPoints - reward.value,
        earnedRewards: [...prev.earnedRewards, reward],
      }));
      alert(`🎉 ${reward.name}을(를) 획득했습니다!`);
    }
  };

  // 도전과제 보상 받기
  const handleClaimChallenge = (id: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === id && !c.completed && c.currentCount >= c.targetCount) {
        setUserStats(s => ({ ...s, totalPoints: s.totalPoints + c.rewardPoints }));
        alert(`🎉 도전과제 완료! +${c.rewardPoints} 포인트 획득!`);
        return { ...c, completed: true };
      }
      return c;
    }));
  };

  // 일일/주간 도전과제 필터링
  const dailyChallenges = useMemo(() => 
    challenges.filter(c => c.type === ChallengeType.DAILY),
    [challenges]
  );

  const weeklyChallenges = useMemo(() => 
    challenges.filter(c => c.type === ChallengeType.WEEKLY),
    [challenges]
  );

  const monthlyChallenges = useMemo(() => 
    challenges.filter(c => c.type === ChallengeType.MONTHLY),
    [challenges]
  );

  // 모달 열기
  const openAddModal = (type: TaskType) => {
    setModalTaskType(type);
    setIsModalOpen(true);
  };

  // 작업 추가
  const handleAddTask = (task: Habit | Daily | Todo) => {
    if ('habitType' in task) {
      setHabits(prev => [...prev, task as Habit]);
    } else if ('frequency' in task) {
      setDailies(prev => [...prev, task as Daily]);
    } else {
      setTodos(prev => [...prev, task as Todo]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
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
                  onClick={() => setMainTab('tasks')}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    mainTab === 'tasks'
                      ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  📝 작업
                </button>
                <button
                  onClick={() => setMainTab('challenges')}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    mainTab === 'challenges'
                      ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  🏆 도전과제
                </button>
                <button
                  onClick={() => setMainTab('rewards')}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    mainTab === 'rewards'
                      ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  🎁 보상
                </button>
              </div>

              <div className="flex gap-2">
                <Link href="/login">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    로그인
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md active:scale-95">
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
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="메뉴"
              >
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* 모바일 메뉴 */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setMainTab('tasks');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${
                    mainTab === 'tasks'
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  📝 작업
                </button>
                <button
                  onClick={() => {
                    setMainTab('challenges');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${
                    mainTab === 'challenges'
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  🏆 도전과제
                </button>
                <button
                  onClick={() => {
                    setMainTab('rewards');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${
                    mainTab === 'rewards'
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 왼쪽: 통계 & 날짜 선택 */}
          <div className="lg:col-span-1 space-y-6">
            <SimpleStatsCard stats={userStats} />

            {/* 날짜 선택 달력 (일일목표/할일 탭일 때만 표시) */}
            {mainTab === 'tasks' && (taskTab === 'dailies' || taskTab === 'todos') && (
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
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
                <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    <button
                      onClick={() => setTaskTab('habits')}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                        taskTab === 'habits'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      ⚡ 습관
                    </button>
                    <button
                      onClick={() => setTaskTab('dailies')}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                        taskTab === 'dailies'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      📅 일일목표
                    </button>
                    <button
                      onClick={() => setTaskTab('todos')}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                        taskTab === 'todos'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      📋 할일
                    </button>
                  </div>
                </div>

                {/* 작업 컨텐츠 */}
                {taskTab === 'habits' && (
                  <div>
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ⚡ 습관 (Habits)
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          반복하고 싶은 긍정적 습관이나 줄이고 싶은 부정적 습관을 추적하세요
                        </p>
                      </div>
                      <button
                        onClick={() => openAddModal(TaskType.HABIT)}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <span className="text-xl">+</span>
                        <span>추가</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {habits.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                          <p className="text-gray-500 dark:text-gray-400">습관이 없습니다</p>
                        </div>
                      ) : (
                        habits.map(habit => (
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

                {taskTab === 'dailies' && (
                  <div>
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                          📅 일일 목표 ({formatDate(selectedDate)})
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          매일/매주/매월 반복되는 목표를 관리하세요
                        </p>
                      </div>
                      <button
                        onClick={() => openAddModal(TaskType.DAILY)}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <span className="text-xl">+</span>
                        <span>추가</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {dailiesWithCompletion.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                          <p className="text-gray-500 dark:text-gray-400">일일 목표가 없습니다</p>
                        </div>
                      ) : (
                        dailiesWithCompletion.map(daily => (
                          <DailyCard
                            key={daily.id}
                            daily={daily}
                            onToggle={handleDailyToggle}
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
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                          📋 할 일 ({formatDate(selectedDate)})
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          일회성 작업을 추가하고 완료하세요
                        </p>
                      </div>
                      <button
                        onClick={() => openAddModal(TaskType.TODO)}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <span className="text-xl">+</span>
                        <span>추가</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {filteredTodos.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                          <p className="text-gray-500 dark:text-gray-400">할 일이 없습니다</p>
                        </div>
                      ) : (
                        filteredTodos.map(todo => (
                          <SimpleTodoCard
                            key={todo.id}
                            todo={todo}
                            onStatusChange={handleTodoStatusChange}
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
                <div className="mb-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      📅 일일 도전과제
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      매일 자정에 초기화됩니다
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {dailyChallenges.map(challenge => (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        onClaim={handleClaimChallenge}
                      />
                    ))}
                  </div>
                </div>

                {/* 주간 도전과제 */}
                <div className="mb-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      🗓️ 주간 도전과제
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      매주 월요일에 초기화됩니다
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {weeklyChallenges.map(challenge => (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        onClaim={handleClaimChallenge}
                      />
                    ))}
                  </div>
                </div>

                {/* 월간 도전과제 */}
                <div>
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      📆 월간 도전과제
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      매달 1일에 초기화됩니다
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {monthlyChallenges.map(challenge => (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        onClaim={handleClaimChallenge}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* 보상 탭 */
              <RewardShop
                rewards={mockRewards}
                userPoints={userStats.totalPoints}
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
