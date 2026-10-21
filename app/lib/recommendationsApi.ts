import type { Recommendation, RecommendationsResponse } from '@/app/types/recommendation';
import { apiFetch } from '@/app/lib/apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface RecommendationApiResponse<T> {
  data: T | null;
  message?: string | string[];
}

async function requestRecommendations<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(`${API_URL}/api/recommendations${path}`, {
    ...init,
    cache: 'no-store',
  });
  const body = (await response.json().catch(() => null)) as RecommendationApiResponse<T> | null;

  if (!response.ok || body?.data == null) {
    const message = body?.message;
    throw new Error(
      (Array.isArray(message) ? message[0] : message) ||
        '추천을 불러오지 못했어요. 잠시 후 다시 시도해주세요.'
    );
  }

  return body.data;
}

export function fetchRecommendations(signal?: AbortSignal): Promise<RecommendationsResponse> {
  return requestRecommendations<RecommendationsResponse>('', { signal });
}

export function generateRecommendations(signal?: AbortSignal): Promise<RecommendationsResponse> {
  return requestRecommendations<RecommendationsResponse>('/generate', {
    method: 'POST',
    signal,
  });
}

export function acceptRecommendation(id: number, signal?: AbortSignal): Promise<Recommendation> {
  return requestRecommendations<Recommendation>(`/${id}/accept`, { method: 'POST', signal });
}

export function dismissRecommendation(id: number, signal?: AbortSignal): Promise<Recommendation> {
  return requestRecommendations<Recommendation>(`/${id}/dismiss`, { method: 'POST', signal });
}
