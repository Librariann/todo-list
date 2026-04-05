// Habitica 스타일 Mock 데이터

import {
  TodoStatus,
  Reward,
  RewardType,
  UserStats,
  Habit,
  HabitType,
  Goal,
  GoalFrequency,
  Todo,
  Challenge,
  ChallengeType,
  ChallengeCondition,
} from '../types/todo';

export const mockRewards: Reward[] = [
  {
    id: '1',
    type: RewardType.COFFEE_COUPON,
    name: '스타벅스 아메리카노',
    description: '스타벅스 톨사이즈 아메리카노 쿠폰',
    value: 1000,
    iconUrl: '☕',
  },
  {
    id: '2',
    type: RewardType.GIFT_CARD,
    name: '1만원 기프트카드',
    description: '네이버페이 1만원 상품권',
    value: 5000,
    iconUrl: '🎁',
  },
  {
    id: '3',
    type: RewardType.DISCOUNT,
    name: '20% 할인쿠폰',
    description: '전 품목 20% 할인',
    value: 2000,
    iconUrl: '🎫',
  },
];

// 오늘 날짜
const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

// 습관 (Habits) Mock 데이터
export const mockHabits: Habit[] = [
  {
    id: 'h1',
    title: '물 마시기',
    habitType: HabitType.POSITIVE,
    positiveCount: 5,
    negativeCount: 0,
    dailyTarget: 8,
    dailyProgress: {
      [today]: 5,
      [yesterday]: 8,
      [twoDaysAgo]: 6,
    },
    lastUpdatedDate: today,
    createdAt: new Date(),
  },
  {
    id: 'h2',
    title: '운동하기',
    habitType: HabitType.BOTH,
    positiveCount: 3,
    negativeCount: 1,
    dailyTarget: 1,
    dailyProgress: {
      [today]: 1,
      [yesterday]: 1,
      [twoDaysAgo]: 1,
    },
    lastUpdatedDate: today,
    createdAt: new Date(),
  },
  {
    id: 'h3',
    title: '간식 먹기',
    habitType: HabitType.NEGATIVE,
    positiveCount: 0,
    negativeCount: 2,
    dailyTarget: 3,
    dailyProgress: {
      [today]: 2,
      [yesterday]: 1,
    },
    lastUpdatedDate: today,
    createdAt: new Date(),
  },
  {
    id: 'h4',
    title: '명상하기',
    habitType: HabitType.POSITIVE,
    positiveCount: 2,
    negativeCount: 0,
    dailyTarget: 2,
    dailyProgress: {
      [today]: 2,
      [yesterday]: 2,
    },
    lastUpdatedDate: today,
    createdAt: new Date(),
  },
];

// 목표 Mock 데이터
export const mockGoals: Goal[] = [
  {
    id: 'd1',
    title: '아침 스트레칭',
    frequency: GoalFrequency.DAILY,
    completedDates: [today, yesterday, twoDaysAgo],
    streak: 3,
    createdAt: new Date(),
  },
  {
    id: 'd2',
    title: '영어 단어 10개 외우기',
    frequency: GoalFrequency.DAILY,
    completedDates: [yesterday, twoDaysAgo],
    streak: 2,
    createdAt: new Date(),
  },
  {
    id: 'd3',
    title: '독서 30분',
    frequency: GoalFrequency.DAILY,
    completedDates: [today],
    streak: 1,
    createdAt: new Date(),
  },
  {
    id: 'd4',
    title: '주간 회고 작성',
    frequency: GoalFrequency.WEEKLY,
    completedDates: [],
    streak: 0,
    createdAt: new Date(),
  },
];

// 할 일 (Todos) Mock 데이터
export const mockTodos: Todo[] = [
  {
    id: 't1',
    title: '프로젝트 기획서 작성',
    status: TodoStatus.IN_PROGRESS,
    date: today,
    createdAt: new Date(),
  },
  {
    id: 't2',
    title: 'TypeScript 공부하기',
    status: TodoStatus.TODO,
    date: today,
    createdAt: new Date(),
  },
  {
    id: 't3',
    title: '이메일 답장',
    status: TodoStatus.TODO,
    date: today,
    createdAt: new Date(),
  },
  {
    id: 't4',
    title: 'UI 디자인 리뷰',
    status: TodoStatus.DONE,
    date: today,
    createdAt: new Date(),
    completedAt: new Date(),
  },
];

// 도전과제 Mock 데이터
export const mockChallenges: Challenge[] = [
  // 일일 도전과제
  {
    id: 'c1',
    title: '일일 습관왕',
    description: '습관을 5회 이상 달성하세요',
    type: ChallengeType.DAILY,
    condition: ChallengeCondition.COMPLETE_HABITS,
    targetCount: 5,
    currentCount: 3,
    rewardPoints: 50,
    completed: false,
    iconUrl: '⚡',
    resetDate: today,
  },
  {
    id: 'c2',
    title: '오늘의 루틴',
    description: '모든 목표를 완료하세요',
    type: ChallengeType.DAILY,
    condition: ChallengeCondition.COMPLETE_ALL_GOALS,
    targetCount: 4,
    currentCount: 2,
    rewardPoints: 100,
    completed: false,
    iconUrl: '🎯',
    resetDate: today,
  },
  {
    id: 'c3',
    title: '할 일 마스터',
    description: '할 일을 3개 이상 완료하세요',
    type: ChallengeType.DAILY,
    condition: ChallengeCondition.COMPLETE_TODOS,
    targetCount: 3,
    currentCount: 1,
    rewardPoints: 30,
    completed: false,
    iconUrl: '✅',
    resetDate: today,
  },
  // 주간 도전과제
  {
    id: 'c4',
    title: '주간 포인트 헌터',
    description: '이번 주 500 포인트 획득하기',
    type: ChallengeType.WEEKLY,
    condition: ChallengeCondition.EARN_POINTS,
    targetCount: 500,
    currentCount: 340,
    rewardPoints: 200,
    completed: false,
    iconUrl: '💎',
  },
  {
    id: 'c5',
    title: '주간 목표 달성',
    description: '목표 20개 완료하기',
    type: ChallengeType.WEEKLY,
    condition: ChallengeCondition.COMPLETE_GOALS,
    targetCount: 20,
    currentCount: 8,
    rewardPoints: 150,
    completed: false,
    iconUrl: '📅',
  },
  {
    id: 'c6',
    title: '완벽한 한 주',
    description: '일주일 동안 매일 습관 10회 이상',
    type: ChallengeType.WEEKLY,
    condition: ChallengeCondition.COMPLETE_HABITS,
    targetCount: 70,
    currentCount: 45,
    rewardPoints: 300,
    completed: false,
    iconUrl: '🏆',
  },
  // 월간 도전과제
  {
    id: 'c7',
    title: '월간 마라토너',
    description: '이번 달 습관 200회 달성하기',
    type: ChallengeType.MONTHLY,
    condition: ChallengeCondition.COMPLETE_HABITS,
    targetCount: 200,
    currentCount: 85,
    rewardPoints: 1000,
    completed: false,
    iconUrl: '🎖️',
  },
  {
    id: 'c8',
    title: '월간 목표 달성자',
    description: '이번 달 목표 80개 완료하기',
    type: ChallengeType.MONTHLY,
    condition: ChallengeCondition.COMPLETE_GOALS,
    targetCount: 80,
    currentCount: 35,
    rewardPoints: 800,
    completed: false,
    iconUrl: '🌟',
  },
  {
    id: 'c9',
    title: '월간 포인트 왕',
    description: '이번 달 2000 포인트 획득하기',
    type: ChallengeType.MONTHLY,
    condition: ChallengeCondition.EARN_POINTS,
    targetCount: 2000,
    currentCount: 680,
    rewardPoints: 500,
    completed: false,
    iconUrl: '👑',
  },
];

// 완료된 도전과제 샘플
const completedChallenge1: Challenge = {
  id: 'cc1',
  title: '첫 습관 달성',
  description: '습관을 3회 달성했습니다',
  type: ChallengeType.DAILY,
  condition: ChallengeCondition.COMPLETE_HABITS,
  targetCount: 3,
  currentCount: 3,
  rewardPoints: 30,
  completed: true,
  iconUrl: '⚡',
  resetDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
};

const completedChallenge2: Challenge = {
  id: 'cc2',
  title: '할일 정복자',
  description: '할 일 5개를 완료했습니다',
  type: ChallengeType.WEEKLY,
  condition: ChallengeCondition.COMPLETE_TODOS,
  targetCount: 5,
  currentCount: 5,
  rewardPoints: 50,
  completed: true,
  iconUrl: '✅',
};

export const mockUserStats: UserStats = {
  totalPoints: 340,
  earnedRewards: [mockRewards[0]],
  currentStreak: 3,
  level: 5,
  experience: 250,
  experienceToNextLevel: 500,
  recentRewards: [mockRewards[0], mockRewards[2]], // 최근 획득한 보상
  recentCompletedChallenges: [completedChallenge1, completedChallenge2], // 최근 달성한 도전과제
};
