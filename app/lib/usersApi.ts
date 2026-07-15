import { API_URL } from '@/lib/constant';
import { UserSummaryResponse } from '../types/common';
import { apiFetch } from './apiClient';

export interface UserProfile {
  id: number;
  nickname: string;
  email: string;
  name: string | null;
  phoneNumber: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'WITHDRAWN';
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileInput {
  nickname: string;
  name: string;
  phoneNumber: string;
}

export async function checkNicknameAvailability(
  nickname: string,
  signal?: AbortSignal
): Promise<boolean> {
  const encodedNickname = encodeURIComponent(nickname);
  const response = await apiFetch(`${API_URL}/api/users/check-username/${encodedNickname}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, '닉네임 중복 여부를 확인하지 못했습니다.'));
  }

  const body = (await response.json()) as { data: boolean };
  return body.data;
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const body = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
  const message = body?.message;

  if (Array.isArray(message)) return message[0] ?? fallback;
  return message ?? fallback;
}

export async function fetchMyProfile(): Promise<UserProfile> {
  const response = await apiFetch(`${API_URL}/api/users/me`);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, '내 정보를 불러오지 못했습니다.'));
  }

  const body = await response.json();
  return body.data as UserProfile;
}

export async function updateMyProfile(input: UpdateUserProfileInput): Promise<UserProfile> {
  const response = await apiFetch(`${API_URL}/api/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, '내 정보를 수정하지 못했습니다.'));
  }

  const body = await response.json();
  return body.data as UserProfile;
}

export async function fetchUserSummary(): Promise<UserSummaryResponse> {
  const response = await apiFetch(`${API_URL}/api/user/summary/`);
  if (!response.ok) {
    throw new Error('사용자 요약 정보를 불러오지 못했습니다.');
  }
  const body = await response.json();
  return (body.data ?? {}) as UserSummaryResponse;
}
