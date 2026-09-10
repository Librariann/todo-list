import { API_URL } from '@/lib/constant';
import { apiFetch } from './apiClient';

export interface NotificationSettings {
  pushEnabled: boolean;
  dailyReminderTime: string;
  timezone: string;
}

export interface UpdateNotificationSettingsInput {
  pushEnabled: boolean;
  dailyReminderTime: string;
  timezone: string;
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const body = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
  const message = body?.message;
  return Array.isArray(message) ? (message[0] ?? fallback) : (message ?? fallback);
}

export async function fetchNotificationSettings(): Promise<NotificationSettings> {
  const response = await apiFetch(`${API_URL}/api/push/preferences`);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, '알림 설정을 불러오지 못했습니다.'));
  }

  const body = await response.json();
  return body.data as NotificationSettings;
}

export async function updateNotificationSettings(
  input: UpdateNotificationSettingsInput
): Promise<NotificationSettings> {
  const response = await apiFetch(`${API_URL}/api/push/preferences`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, '알림 설정을 저장하지 못했습니다.'));
  }

  const body = await response.json();
  return body.data as NotificationSettings;
}
