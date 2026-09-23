import { apiFetch } from './apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type RewardCouponStatus = 'AVAILABLE' | 'ASSIGNED' | 'USED' | 'DISABLED' | 'EXPIRED';

export interface RewardCouponInventoryItem {
  id: number;
  provider: 'GIFTISHOW';
  providerOrderNumber: string | null;
  maskedPin: string;
  expiresAt: string;
  status: RewardCouponStatus;
  assignedAt: string | null;
  createdAt: string;
}

export interface CreateRewardCouponInput {
  rewardId: number;
  pinCode: string;
  expiresAt: string;
  providerOrderNumber?: string;
  image: File;
}

async function readError(response: Response, fallback: string): Promise<string> {
  const body = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
  if (Array.isArray(body?.message)) return body.message.join(' ');
  return body?.message ?? fallback;
}

export async function fetchRewardCoupons(rewardId: number): Promise<RewardCouponInventoryItem[]> {
  const response = await apiFetch(`${API_URL}/api/admin/rewards/${rewardId}/coupons`);
  if (!response.ok) {
    throw new Error(await readError(response, '쿠폰 재고를 불러오지 못했어요.'));
  }

  const body = (await response.json()) as { data?: RewardCouponInventoryItem[] };
  return body.data ?? [];
}

export async function createRewardCoupon(
  input: CreateRewardCouponInput
): Promise<RewardCouponInventoryItem> {
  const formData = new FormData();
  formData.append('pinCode', input.pinCode);
  formData.append('expiresAt', input.expiresAt);
  if (input.providerOrderNumber?.trim()) {
    formData.append('providerOrderNumber', input.providerOrderNumber.trim());
  }
  formData.append('image', input.image);

  const response = await apiFetch(`${API_URL}/api/admin/rewards/${input.rewardId}/coupons`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error(await readError(response, '쿠폰을 등록하지 못했어요.'));
  }

  const body = (await response.json()) as { data: RewardCouponInventoryItem };
  return body.data;
}

export async function updateRewardCouponStatus(
  rewardId: number,
  couponId: number,
  status: Extract<RewardCouponStatus, 'AVAILABLE' | 'DISABLED'>
): Promise<RewardCouponInventoryItem> {
  const response = await apiFetch(
    `${API_URL}/api/admin/rewards/${rewardId}/coupons/${couponId}/status`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }
  );
  if (!response.ok) {
    throw new Error(await readError(response, '쿠폰 상태를 변경하지 못했어요.'));
  }

  const body = (await response.json()) as { data: RewardCouponInventoryItem };
  return body.data;
}

export async function fetchOwnedCouponImage(imagePath: string): Promise<Blob> {
  const imageUrl = imagePath.startsWith('http') ? imagePath : `${API_URL}${imagePath}`;
  let isGrowDoApi = imagePath.startsWith('/');
  if (!isGrowDoApi && API_URL) {
    try {
      isGrowDoApi = new URL(imageUrl).origin === new URL(API_URL).origin;
    } catch {
      throw new Error('올바르지 않은 쿠폰 이미지 주소예요.');
    }
  }
  console.log(imageUrl, isGrowDoApi);
  const response = isGrowDoApi
    ? await apiFetch(imageUrl)
    : await fetch(imageUrl, { credentials: 'omit' });
  if (!response.ok) {
    throw new Error(await readError(response, '쿠폰 이미지를 불러오지 못했어요.'));
  }
  return response.blob();
}
