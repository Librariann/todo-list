import { apiFetch } from './apiClient';
import { getDatesInRange, getTodayDateString } from './dateUtils';
import { GoalFrequency, type Goal, type GoalPeriod } from '../types/todo';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface GoalResponse {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string | null;
  recurrenceType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  startDate: string;
  targetCount: number;
}

export interface GoalProcessResponse {
  id: number;
  createdAt: string;
  updatedAt: string;
  goalId: number;
  goalName: string;
  periodIndex: number;
  periodStart: string;
  periodEnd: string;
  currentCount: number;
  targetCount: number;
  isAchieved: boolean;
  achievedAt: string | null;
  isFinalized: boolean;
  progressPercentage: number;
  daysRemaining: number;
}

interface GoalDateResponse extends GoalResponse {
  streak: number;
  period: GoalPeriod;
}

function mapFrequency(recurrenceType: GoalResponse['recurrenceType']): GoalFrequency {
  if (recurrenceType === 'DAILY') return GoalFrequency.DAILY;
  if (recurrenceType === 'WEEKLY') return GoalFrequency.WEEKLY;
  return GoalFrequency.MONTHLY;
}

function mapGoalByDate(goal: GoalDateResponse): Goal {
  return {
    id: goal.id.toString(),
    title: goal.name,
    frequency: mapFrequency(goal.recurrenceType),
    completedDates: goal.period.isAchieved
      ? getDatesInRange(goal.period.start, goal.period.end)
      : [],
    streak: goal.streak,
    startDate: goal.startDate,
    createdAt: new Date(goal.createdAt),
    period: goal.period,
  };
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const body = (await response.json().catch(() => null)) as
    | { message?: string | string[] }
    | null;
  const message = body?.message;
  if (Array.isArray(message)) return message[0] ?? fallback;
  return message ?? fallback;
}

export async function fetchGoalsByDate(date: string, signal?: AbortSignal): Promise<Goal[]> {
  const response = await apiFetch(`${API_URL}/api/goals/by-date/${date}`, { signal });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, '선택한 날짜의 목표를 불러오지 못했습니다.'));
  }

  const body = (await response.json()) as { data?: GoalDateResponse[] };
  return (body.data ?? []).map(mapGoalByDate);
}

export async function achieveGoal(goalId: string): Promise<GoalProcessResponse> {
  const response = await apiFetch(`${API_URL}/api/goals/${goalId}/achieve`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, '목표를 완료하지 못했습니다.'));
  }

  const body = await response.json();
  return body.data as GoalProcessResponse;
}

export async function deleteGoal(goalId: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/api/goals/${goalId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, '목표를 삭제하지 못했습니다.'));
  }
}

export async function createGoal(
  name: string,
  recurrenceType: GoalResponse['recurrenceType'] = 'DAILY',
  startDate: string = getTodayDateString()
): Promise<void> {
  const response = await apiFetch(`${API_URL}/api/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      recurrenceType,
      interval: 1,
      startDate,
      targetCount: 1,
    }),
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, '목표를 생성하지 못했습니다.'));
  }
}
