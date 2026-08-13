import { useAuthStore } from '@/app/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processPendingQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  pendingQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, setAccessToken, clearAuth } = useAuthStore.getState();

  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: refreshToken ? JSON.stringify({ refresh: refreshToken }) : JSON.stringify({}),
  });

  if (!res.ok) {
    clearAuth();
    window.location.href = '/login';
    throw new Error('Token refresh failed');
  }

  const json = await res.json();
  const data = json.data ?? json;
  setAccessToken(data.accessToken);
  return data.accessToken;
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const { accessToken } = useAuthStore.getState();

  const headers = new Headers(init?.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(input, {
    ...init,
    credentials: init?.credentials ?? 'include',
    headers,
  });

  // 401 가 아니면 그대로 반환
  if (response.status !== 401) return response;

  // 이미 갱신 중이면 큐에 대기
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      pendingQueue.push({
        resolve: async (newToken) => {
          headers.set('Authorization', `Bearer ${newToken}`);
          resolve(
            await fetch(input, {
              ...init,
              credentials: init?.credentials ?? 'include',
              headers,
            })
          );
        },
        reject,
      });
    });
  }

  isRefreshing = true;

  try {
    const newToken = await refreshAccessToken();
    processPendingQueue(null, newToken);
    headers.set('Authorization', `Bearer ${newToken}`);
    return await fetch(input, {
      ...init,
      credentials: init?.credentials ?? 'include',
      headers,
    });
  } catch (error) {
    processPendingQueue(error, null);
    throw error;
  } finally {
    isRefreshing = false;
  }
}
