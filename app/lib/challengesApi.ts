import { apiFetch } from './apiClient';
import { Challenge, ChallengeType, ChallengeCondition } from '../types/todo';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ChallengesApiResponse {
  id: number;
  name: string;
  description: string;
  icon: string;
  recurrenceType: string;
  // workType: 'HABITS' | 'TODOS' | 'GOALS'; // 자동 부제목 적용 시 활성화
  targetCount: number;
  // dailyMaxCount: number; // 자동 부제목 적용 시 활성화
  point: number;
  isActive: boolean;
  isAchieved: boolean;
}

export interface UserChallengeProgressResponse extends ChallengesApiResponse {
  currentCount: number;
  completed: boolean;
}

function mapRecurrenceType(recurrenceType: string): ChallengeType {
  if (recurrenceType === 'DAILY') {
    return ChallengeType.DAILY;
  }

  if (recurrenceType === 'WEEKLY') {
    return ChallengeType.WEEKLY;
  }

  return ChallengeType.MONTHLY;
}

/* 정책 확정 후 작업 종류에 맞는 조건과 부제목을 자동 생성할 때 활성화
function mapCondition(workType: 'HABITS' | 'TODOS' | 'GOALS'): ChallengeCondition {
  switch (workType) {
    case 'TODOS':
      return ChallengeCondition.COMPLETE_TODOS;
    case 'GOALS':
      return ChallengeCondition.COMPLETE_GOALS;
    default:
      return ChallengeCondition.COMPLETE_HABITS;
  }
}

function createChallengeSubtitle(challenge: ChallengesApiResponse): string {
  const periodLabel =
    challenge.recurrenceType === 'DAILY'
      ? '오늘'
      : challenge.recurrenceType === 'WEEKLY'
        ? '이번 주'
        : '이번 달';

  const targetLabel =
    challenge.workType === 'HABITS'
      ? `습관을 ${challenge.targetCount}회 달성하면 완료`
      : challenge.workType === 'TODOS'
        ? `할 일을 ${challenge.targetCount}개 완료하면 달성`
        : `목표를 ${challenge.targetCount}개 달성하면 완료`;

  const dailyLimitLabel =
    challenge.recurrenceType !== 'DAILY' && challenge.dailyMaxCount < challenge.targetCount
      ? ` · 하루 최대 ${challenge.dailyMaxCount}회 반영`
      : '';

  return `${periodLabel} ${targetLabel}${dailyLimitLabel}`;
}
*/

export function mapUserChallengeProgress(c: UserChallengeProgressResponse): Challenge {
  return {
    id: c.id.toString(),
    title: c.name,
    // subtitle: createChallengeSubtitle(c),
    description: c.description || '',
    type: mapRecurrenceType(c.recurrenceType),
    condition: ChallengeCondition.COMPLETE_HABITS,
    targetCount: c.targetCount,
    currentCount: c.currentCount,
    rewardPoints: c.point,
    completed: c.isAchieved,
  };
}

export function mapChallenge(challenge: ChallengesApiResponse): Challenge {
  return {
    id: challenge.id.toString(),
    title: challenge.name,
    // subtitle: createChallengeSubtitle(challenge),
    description: challenge.description || '',
    type: mapRecurrenceType(challenge.recurrenceType),
    condition: ChallengeCondition.COMPLETE_HABITS,
    targetCount: challenge.targetCount,
    currentCount: 0,
    rewardPoints: challenge.point,
    completed: false,
  };
}

export async function fetchUserChallengeProgress(): Promise<Challenge[]> {
  const res = await apiFetch(`${API_URL}/api/user/challenges/`);
  if (!res.ok) {
    const errorBody = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorBody?.message ?? '도전과제를 불러오지 못했습니다.');
  }
  const data = await res.json();
  const raw = (data.data ?? []) as UserChallengeProgressResponse[];
  return raw.map(mapUserChallengeProgress);
}

export async function fetchChallenges(): Promise<Challenge[]> {
  const res = await apiFetch(`${API_URL}/api/challenges/`);
  if (!res.ok) {
    throw new Error('Failed to fetch challenges');
  }
  const data = await res.json();
  const raw = (data.data ?? []) as ChallengesApiResponse[];
  return raw.filter((c) => c.isActive).map(mapChallenge);
}
