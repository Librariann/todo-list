// ─── Types ────────────────────────────────────────────────────────────────────

export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type WorkType = 'HABITS' | 'TODOS' | 'GOALS';
export type RewardType = 'COUPON' | 'POINT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'WITHDRAWN';
export type UserRole = 'USER' | 'ADMIN';

export interface Challenge {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  icon: string;
  recurrenceType: RecurrenceType;
  workType: WorkType;
  targetCount: number;
  dailyMaxCount: number;
  point: number;
  isActive: boolean;
  isSelected?: boolean;
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

export interface ChallengeRotationSetting {
  periodType: RecurrenceType;
  selectionCount: number;
  cooldownPeriods: number;
}

export type ChallengeRotationTrigger = 'CRON' | 'LAZY' | 'MANUAL' | 'LEGACY';
export type ChallengeRotationStatus = 'SUCCESS' | 'FAILED';

export interface ChallengeRotationRun {
  id: number;
  createdAt: string;
  periodType: RecurrenceType;
  periodKey: string;
  trigger: ChallengeRotationTrigger;
  status: ChallengeRotationStatus;
  requestedCount: number;
  selectedCount: number;
  selectedChallenges: Array<Pick<Challenge, 'id' | 'name' | 'workType'>>;
  actorUserId: number | null;
  message: string | null;
}

export interface ChallengeRotationPreview {
  periodType: RecurrenceType;
  periodKey: string;
  requestedCount: number;
  candidates: Challenge[];
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
  name: string | null;
  phoneNumber: string | null;
  status: UserStatus;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  pointBalance: number;
  coupons: AdminUserCoupon[];
}

export interface AdminUserCoupon {
  id: number;
  name: string;
  description: string;
  point: number;
  isUsed: boolean;
  createdAt: string;
  updatedAt: string;
}
