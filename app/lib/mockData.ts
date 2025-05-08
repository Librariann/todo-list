// 심플한 Mock 데이터

import { TodoStatus, Reward, RewardType, UserStats, DailyTodos } from '../types/todo';

export const mockRewards: Reward[] = [
  {
    id: '1',
    type: RewardType.COFFEE_COUPON,
    name: '스타벅스 아메리카노',
    description: '스타벅스 톨사이즈 아메리카노 쿠폰',
    value: 100,
    iconUrl: '☕',
  },
  {
    id: '2',
    type: RewardType.GIFT_CARD,
    name: '1만원 기프트카드',
    description: '네이버페이 1만원 상품권',
    value: 500,
    iconUrl: '🎁',
  },
  {
    id: '3',
    type: RewardType.DISCOUNT,
    name: '20% 할인쿠폰',
    description: '전 품목 20% 할인',
    value: 200,
    iconUrl: '🎫',
  },
];

// 오늘 날짜 (YYYY-MM-DD)
const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

export const mockDailyTodos: DailyTodos[] = [
  {
    date: today,
    todos: [
      {
        id: '1',
        title: '프로젝트 기획서 작성',
        status: TodoStatus.IN_PROGRESS,
        date: today,
        createdAt: new Date(),
        rewardPoints: 50,
      },
      {
        id: '2',
        title: 'TypeScript 공부하기',
        status: TodoStatus.TODO,
        date: today,
        createdAt: new Date(),
        rewardPoints: 30,
      },
      {
        id: '3',
        title: '운동 30분',
        status: TodoStatus.DONE,
        date: today,
        createdAt: new Date(),
        completedAt: new Date(),
        rewardPoints: 20,
        earnedReward: mockRewards[0],
      },
      {
        id: '4',
        title: '책 읽기',
        status: TodoStatus.TODO,
        date: today,
        createdAt: new Date(),
        rewardPoints: 25,
      },
    ],
  },
  {
    date: yesterday,
    todos: [
      {
        id: '5',
        title: 'UI 디자인 리뷰',
        status: TodoStatus.DONE,
        date: yesterday,
        createdAt: new Date(yesterday),
        completedAt: new Date(yesterday),
        rewardPoints: 40,
      },
      {
        id: '6',
        title: '회의 참석',
        status: TodoStatus.DONE,
        date: yesterday,
        createdAt: new Date(yesterday),
        completedAt: new Date(yesterday),
        rewardPoints: 15,
      },
      {
        id: '7',
        title: '이메일 답장',
        status: TodoStatus.TODO,
        date: yesterday,
        createdAt: new Date(yesterday),
        rewardPoints: 10,
      },
    ],
  },
  {
    date: twoDaysAgo,
    todos: [
      {
        id: '8',
        title: '코드 리뷰',
        status: TodoStatus.DONE,
        date: twoDaysAgo,
        createdAt: new Date(twoDaysAgo),
        completedAt: new Date(twoDaysAgo),
        rewardPoints: 30,
      },
      {
        id: '9',
        title: '문서 작성',
        status: TodoStatus.DONE,
        date: twoDaysAgo,
        createdAt: new Date(twoDaysAgo),
        completedAt: new Date(twoDaysAgo),
        rewardPoints: 25,
      },
    ],
  },
];

export const mockUserStats: UserStats = {
  totalPoints: 240,
  earnedRewards: [mockRewards[0]],
  currentStreak: 3,
};
