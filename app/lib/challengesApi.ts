import { apiFetch } from './apiClient';
import { Challenge, ChallengeType, ChallengeCondition } from '../types/todo';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ChallengesApiResponse {
  id: number;
  name: string;
  description: string;
  icon: string;
  recurrenceType: string;
  targetCount: number;
  point: number;
  isActive: boolean;
  isAchieved: boolean;
}

export interface UserChallengeProgressResponse extends ChallengesApiResponse {
  currentCount: number;
  completed: boolean;
}

function mapRecurrenceType(recurrenceType: string): ChallengeType {
  if (recurrenceType === 'DAILY') return ChallengeType.DAILY;
  if (recurrenceType === 'WEEKLY') return ChallengeType.WEEKLY;
  return ChallengeType.MONTHLY;
}

export function mapUserChallengeProgress(c: UserChallengeProgressResponse): Challenge {
  return {
    id: c.id.toString(),
    title: c.name,
    description: c.description || '',
    type: mapRecurrenceType(c.recurrenceType),
    condition: ChallengeCondition.COMPLETE_HABITS,
    targetCount: c.targetCount,
    currentCount: c.currentCount,
    rewardPoints: c.point,
    completed: c.isAchieved,
    iconUrl: c.icon,
  };
}

export function mapChallenge(c: ChallengesApiResponse): Challenge {
  return {
    id: c.id.toString(),
    title: c.name,
    description: c.description || '',
    type: mapRecurrenceType(c.recurrenceType),
    condition: ChallengeCondition.COMPLETE_HABITS,
    targetCount: c.targetCount,
    currentCount: 0,
    rewardPoints: c.point,
    completed: false,
    iconUrl: c.icon,
  };
}

export async function fetchUserChallengeProgress(): Promise<Challenge[]> {
  const res = await apiFetch(`${API_URL}/api/user/challenges/`);
  if (!res.ok) throw new Error('Failed to fetch user challenge progress');
  const data = await res.json();
  const raw = (data.data ?? []) as UserChallengeProgressResponse[];
  return raw.map(mapUserChallengeProgress);
}

export async function fetchChallenges(): Promise<Challenge[]> {
  const res = await apiFetch(`${API_URL}/api/challenges/`);
  if (!res.ok) throw new Error('Failed to fetch challenges');
  const data = await res.json();
  const raw = (data.data ?? []) as ChallengesApiResponse[];
  return raw.filter((c) => c.isActive).map(mapChallenge);
}
