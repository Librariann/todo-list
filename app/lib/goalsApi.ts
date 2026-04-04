import { apiFetch } from './apiClient';
import { Goal, GoalFrequency } from '../types/todo';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface GoalResponse {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  recurrenceType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  startDate: string;
  targetCount: number;
}

export interface GoalProcessResponse {
  id: number;
  goalId: number;
  goalName: string;
  periodStart: string;
  periodEnd: string;
  currentCount: number;
  targetCount: number;
  isAchieved: boolean;
  isFinalized: boolean;
  progressPercentage: number;
  daysRemaining: number;
}

export interface GoalStreakResponse {
  id: number;
  goalId: number;
  goalName: string;
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
}

export interface GoalDashboardData {
  activeGoals: GoalProcessResponse[];
  activeStreaks: GoalStreakResponse[];
  stats: {
    totalActiveGoals: number;
    totalAchievedToday: number;
    totalActiveStreaks: number;
    longestCurrentStreak: number;
    maxStreakEver: number;
    totalStreaksActive: number;
  };
}

function mapFrequency(recurrenceType: string): GoalFrequency {
  if (recurrenceType === 'DAILY') return GoalFrequency.DAILY;
  if (recurrenceType === 'WEEKLY') return GoalFrequency.WEEKLY;
  return GoalFrequency.MONTHLY;
}

export function buildGoal(
  goal: GoalResponse,
  progress: GoalProcessResponse | undefined,
  streak: GoalStreakResponse | undefined,
  today: string
): Goal {
  const completedDates = progress?.isAchieved && progress.periodStart === today ? [today] : [];
  return {
    id: goal.id.toString(),
    title: goal.name,
    frequency: mapFrequency(goal.recurrenceType),
    completedDates,
    streak: streak?.currentStreak ?? 0,
    createdAt: new Date(goal.createdAt),
  };
}

export async function fetchGoalsWithProgress(): Promise<Goal[]> {
  const today = new Date().toISOString().split('T')[0];

  const [goalsRes, dashboardRes] = await Promise.all([
    apiFetch(`${API_URL}/api/goals`),
    apiFetch(`${API_URL}/api/goals/dashboard`),
  ]);

  if (!goalsRes.ok) throw new Error('Failed to fetch goals');
  const goalsData = await goalsRes.json();
  const goals = (goalsData.data ?? []) as GoalResponse[];

  const progressMap = new Map<number, GoalProcessResponse>();
  const streakMap = new Map<number, GoalStreakResponse>();

  if (dashboardRes.ok) {
    const dashData = await dashboardRes.json();
    const dashboard = dashData.data as GoalDashboardData;
    dashboard.activeGoals?.forEach((p) => progressMap.set(p.goalId, p));
    dashboard.activeStreaks?.forEach((s) => streakMap.set(s.goalId, s));
  }

  return goals.map((g) => buildGoal(g, progressMap.get(g.id), streakMap.get(g.id), today));
}

export async function achieveGoal(goalId: string): Promise<GoalProcessResponse> {
  const res = await apiFetch(`${API_URL}/api/goals/${goalId}/achieve`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to achieve goal');
  const data = await res.json();
  return data.data as GoalProcessResponse;
}

export async function createGoal(
  name: string,
  recurrenceType: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'DAILY'
): Promise<Goal> {
  const today = new Date().toISOString().split('T')[0];
  const res = await apiFetch(`${API_URL}/api/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      recurrenceType,
      interval: 1,
      startDate: today,
      targetCount: 1,
    }),
  });
  if (!res.ok) throw new Error('Failed to create goal');
  const data = await res.json();
  const goal = data.data as GoalResponse;
  return buildGoal(goal, undefined, undefined, today);
}
