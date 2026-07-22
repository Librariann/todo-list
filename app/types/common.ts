type SummaryChallengeResponse = Omit<ChallengeItem, 'isActive' | 'achievedAt'> & {
  active: boolean;
  achievedAt?: string;
};

export interface UserSummaryResponse {
  points: number;
  rewards?: RewardItem[];
  achievedChallenges?: SummaryChallengeResponse[];
}

export interface RewardItem {
  id: number;
  name: string;
  type: 'COUPON' | 'POINT';
  point: number;
  description: string;
  discount?: boolean;
  discountRate?: number;
  used?: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface ChallengeItem {
  id: number;
  name: string;
  description: string;
  icon: string;
  recurrenceType: string;
  targetCount: number;
  point: number;
  isActive: boolean;
  currentCount?: number;
  achieved?: boolean;
  periodType?: string;
  periodKey?: string;
  achievedAt?: string;
}
