import { apiFetch } from '@/app/lib/apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface NoticeSummary {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notice extends NoticeSummary {
  content: string;
  isPublished: boolean;
}

export interface NoticeInput {
  title: string;
  content: string;
  isPublished: boolean;
}

async function readResponse<T>(request: Promise<Response>): Promise<T> {
  let response: Response;
  try {
    response = await request;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('서버에 연결하지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요.');
    }
    throw error;
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 404) throw new Error('공지가 없거나 게시가 종료되었어요.');
    const message = body?.message;
    throw new Error(
      Array.isArray(message)
        ? message.join(' ')
        : message || '공지를 불러오지 못했어요. 다시 시도해 주세요.'
    );
  }
  if (!body || !('data' in body))
    throw new Error('공지 응답을 확인하지 못했어요. 다시 시도해 주세요.');
  return body.data as T;
}

export async function fetchNotices(signal?: AbortSignal): Promise<NoticeSummary[]> {
  return readResponse(fetch(`${API_URL}/api/notices`, { signal, cache: 'no-store' }));
}

export async function fetchNotice(id: string, signal?: AbortSignal): Promise<Notice> {
  return readResponse(
    fetch(`${API_URL}/api/notices/${encodeURIComponent(id)}`, { signal, cache: 'no-store' })
  );
}

export async function fetchAdminNotices(signal?: AbortSignal): Promise<Notice[]> {
  return readResponse(apiFetch(`${API_URL}/api/admin/notices`, { signal, cache: 'no-store' }));
}

export async function saveNotice(input: NoticeInput, id?: number): Promise<Notice> {
  return readResponse(
    apiFetch(`${API_URL}/api/admin/notices${id === undefined ? '' : `/${id}`}`, {
      method: id === undefined ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  );
}

export async function deleteNotice(id: number): Promise<void> {
  await readResponse(apiFetch(`${API_URL}/api/admin/notices/${id}`, { method: 'DELETE' }));
}

export function formatNoticeDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}
