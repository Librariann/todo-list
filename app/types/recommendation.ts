export enum RecommendationType {
  TODO = 'todo',
  HABIT = 'habit',
  GOAL = 'goal',
}

export enum RecommendationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DISMISSED = 'DISMISSED',
}

export enum RecommendationFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export interface RecommendationPayload {
  targetDate?: string;
  dailyTarget?: number;
  unit?: string;
  recurrenceType?: RecommendationFrequency;
  interval?: number;
  startDate?: string;
  targetCount?: number;
}

export interface Recommendation {
  id: number;
  type: RecommendationType;
  title: string;
  reason: string;
  status: RecommendationStatus;
  payload: RecommendationPayload;
  createdItemId: number | null;
  createdAt: string;
}

export interface RecommendationsResponse {
  available: boolean;
  items: Recommendation[];
  message: string | null;
  retryAfterSeconds: number;
}
