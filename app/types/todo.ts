// 심플한 Todo 타입 정의

export enum TodoStatus {
  TODO = 'todo',          // 오늘 할 일
  IN_PROGRESS = 'in_progress',  // 하는 중
  DONE = 'done',         // 다 끝낸 일
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
  value: number; // 포인트 가치
}

export interface Todo {
  id: string;
  title: string;
  status: TodoStatus;
  date: string; // YYYY-MM-DD 형식
  createdAt: Date;
  completedAt?: Date;
  rewardPoints: number;
  earnedReward?: Reward;
}

export interface DailyTodos {
  date: string; // YYYY-MM-DD
  todos: Todo[];
}

export interface UserStats {
  totalPoints: number;
  earnedRewards: Reward[];
  currentStreak: number;
}
