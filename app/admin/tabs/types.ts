// ─── Types ────────────────────────────────────────────────────────────────────

export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type WorkType = 'HABITS' | 'TODOS' | 'GOALS';
export type RewardType = 'COUPON' | 'POINT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type UserRole = 'USER' | 'ADMIN';

export interface Challenge {
  id: number;
  name: string;
  description: string;
  icon: string;
  recurrenceType: RecurrenceType;
  targetCount: number;
  point: number;
  isActive: boolean;
}

export interface ChallengeForm {
  name: string;
  description: string;
  icon: string;
  recurrenceType: RecurrenceType;
  targetCount: number;
  dailyMaxCount: number;
  workType: WorkType;
  point: number;
  isActive: boolean;
}

export const defaultChallengeForm: ChallengeForm = {
  name: '',
  description: '',
  icon: '',
  recurrenceType: 'DAILY',
  targetCount: 1,
  dailyMaxCount: 1,
  workType: 'HABITS',
  point: 10,
  isActive: true,
};

export interface Reward {
  id: number;
  name: string;
  type: RewardType;
  point: number;
  description: string;
  discount: boolean;
  discountRate: number;
  isActive: boolean;
}

export interface RewardForm {
  name: string;
  type: RewardType;
  point: number;
  description: string;
  discount: boolean;
  discountRate: number;
  isActive: boolean;
}

export const defaultRewardForm: RewardForm = {
  name: '',
  type: 'POINT',
  point: 100,
  description: '',
  discount: false,
  discountRate: 0,
  isActive: true,
};

export interface AdminUser {
  id: number;
  nickname: string;
  email: string;
  name: string;
  phoneNumber: string;
  status: UserStatus;
  role: UserRole;
  createdAt: string;
}
