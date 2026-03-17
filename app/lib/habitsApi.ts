import { apiFetch } from './apiClient';
import { Habit, HabitType } from '../types/todo';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── API Response / Request 타입 ─────────────────────────────────────────────

export interface HabitsApiResponse {
  id: number;
  name: string;
  description: string;
  dailyTarget: number;
  unit: string;
  isActive: boolean;
  createdAt: string;
  todayCount: number;
  todayAchieved: boolean;
  currentStreak: number;
  longestStreak: number;
}

export interface CreateHabitPayload {
  name: string;
  dailyTarget: number;
  description?: string;
  unit?: string;
}

export interface UpdateHabitPayload {
  name?: string;
  dailyTarget?: number;
  description?: string;
  unit?: string;
}

// ─── 매퍼 ────────────────────────────────────────────────────────────────────

export function mapApiHabit(api: HabitsApiResponse): Habit {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: api.id.toString(),
    title: api.name,
    habitType: HabitType.BOTH, // API는 +/- 구분 없음 → 양쪽 버튼 표시
    positiveCount: api.todayCount,
    negativeCount: 0,
    dailyTarget: api.dailyTarget,
    dailyProgress: { [today]: api.todayCount },
    lastUpdatedDate: today,
    streak: api.currentStreak, // 서버 스트릭 사용
    createdAt: new Date(api.createdAt),
  };
}

// ─── API 함수 ─────────────────────────────────────────────────────────────────

/** 습관 목록 조회 */
export async function fetchHabits(): Promise<Habit[]> {
  const res = await apiFetch(`${API_URL}/api/habits`);
  if (!res.ok) throw new Error('습관 목록 조회 실패');
  const json = await res.json();
  return ((json.data ?? []) as HabitsApiResponse[]).map(mapApiHabit);
}

/** 습관 생성 */
export async function createHabit(payload: CreateHabitPayload): Promise<Habit> {
  const res = await apiFetch(`${API_URL}/api/habits/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('습관 생성 실패');
  const json = await res.json();
  return mapApiHabit(json.data as HabitsApiResponse);
}

/** 카운터 +1 */
export async function incrementHabit(habitId: string): Promise<Habit> {
  const res = await apiFetch(`${API_URL}/api/habits/${habitId}/increment`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('카운터 증가 실패');
  const json = await res.json();
  return mapApiHabit(json.data as HabitsApiResponse);
}

/** 카운터 -1 */
export async function decrementHabit(habitId: string): Promise<Habit> {
  const res = await apiFetch(`${API_URL}/api/habits/${habitId}/decrement`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('카운터 감소 실패');
  const json = await res.json();
  return mapApiHabit(json.data as HabitsApiResponse);
}

/** 습관 수정 */
export async function updateHabit(habitId: string, payload: UpdateHabitPayload): Promise<Habit> {
  const res = await apiFetch(`${API_URL}/api/habits/${habitId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('습관 수정 실패');
  const json = await res.json();
  return mapApiHabit(json.data as HabitsApiResponse);
}

/** 습관 삭제(비활성화) */
export async function deleteHabit(habitId: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/api/habits/${habitId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('습관 삭제 실패');
}
