// Habitica 스타일 Todo 타입 정의

export enum TaskType {
  HABIT = 'habit',       // 습관 (반복 가능, +/- 버튼)
  DAILY = 'daily',       // 일일 목표 (매일 체크)
  TODO = 'todo',         // 할 일 (일회성)
}

export enum TodoStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum HabitType {
  POSITIVE = 'positive',     // 긍정적 습관만 (+)
  NEGATIVE = 'negative',     // 부정적 습관만 (-)
  BOTH = 'both',             // 둘 다 (+/-)
}

export enum DailyFrequency {
  DAILY = 'daily',           // 매일
  WEEKLY = 'weekly',         // 매주
  MONTHLY = 'monthly',       // 매월
}

export enum RewardType {
  COFFEE_COUPON = 'coffee_coupon',
  GIFT_CARD = 'gift_card',
  DISCOUNT = 'discount',
  POINTS = 'points',
  CUSTOM = 'custom',
}

export interface Reward {
  id: string;
  type: RewardType;
  name: string;
  description: string;
  iconUrl?: string;
  value: number;
}

// 습관 (Habit)
export interface Habit {
  id: string;
  title: string;
  habitType: HabitType;
  positiveCount: number;  // + 클릭 횟수
  negativeCount: number;  // - 클릭 횟수
  dailyTarget?: number;   // 일일 목표 횟수 (옵셔널로 기존 호환성 유지)
  dailyProgress?: { [date: string]: number }; // 날짜별 진행 상황 (YYYY-MM-DD: count)
  lastUpdatedDate?: string; // 마지막 업데이트 날짜 (YYYY-MM-DD)
  createdAt: Date;
}

// 일일 목표 (Daily)
export interface Daily {
  id: string;
  title: string;
  frequency: DailyFrequency;
  completedDates: string[]; // 완료한 날짜 목록 (YYYY-MM-DD)
  streak: number;           // 연속 달성 일수
  createdAt: Date;
}

// 날짜별 일일 목표 완료 상태
export interface DailyWithDate extends Daily {
  completed: boolean; // 선택된 날짜의 완료 여부
  lastCompletedAt?: Date;
}

// 할 일 (Todo)
export interface Todo {
  id: string;
  title: string;
  status: TodoStatus;
  date: string;
  createdAt: Date;
  completedAt?: Date;
}

// 도전과제 타입
export enum ChallengeType {
  DAILY = 'daily',     // 일일 도전과제
  WEEKLY = 'weekly',   // 주간 도전과제
  MONTHLY = 'monthly', // 월간 도전과제
}

export enum ChallengeCondition {
  COMPLETE_HABITS = 'complete_habits',           // 습관 N회 달성
  COMPLETE_DAILIES = 'complete_dailies',         // 일일목표 N개 완료
  COMPLETE_TODOS = 'complete_todos',             // 할일 N개 완료
  COMPLETE_ALL_DAILIES = 'complete_all_dailies', // 모든 일일목표 완료
  EARN_POINTS = 'earn_points',                   // N 포인트 획득
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  condition: ChallengeCondition;
  targetCount: number;      // 목표 횟수/개수
  currentCount: number;     // 현재 달성 횟수/개수
  rewardPoints: number;     // 완료 시 보상 포인트
  completed: boolean;       // 완료 여부
  iconUrl?: string;
  resetDate?: string;       // 리셋 날짜 (YYYY-MM-DD)
}

export interface UserStats {
  totalPoints: number;
  earnedRewards: Reward[];
  currentStreak: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  recentRewards: Reward[]; // 최근 획득한 보상
  recentCompletedChallenges: Challenge[]; // 최근 달성한 도전과제
}
