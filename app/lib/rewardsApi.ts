import { apiFetch } from './apiClient';
import { Reward, RewardType } from '../types/todo';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── API Response 타입 ────────────────────────────────────────────────────────

export interface RewardsApiResponse {
  id: number;
  name: string;
  type: 'COUPON' | 'POINT';
  point: number;
  description: string;
  discount: boolean;
  discountRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OwnedRewardApiResponse {
  id: number;
  name: string;
  type: 'COUPON' | 'POINT';
  point: number;
  description: string;
  discount: boolean;
  discountRate: number;
  isUsed: boolean;
  createdAt: string;
  updatedAt: string;
  couponCode?: string | null;
  couponImageUrl?: string | null;
  expiresAt?: string | null;
}

export function calculateRewardPoint(
  reward: Pick<Reward, 'value' | 'discount' | 'discountRate'>
): number {
  if (!reward.discount) {
    return reward.value;
  }
  const discountRate = Math.min(100, Math.max(0, reward.discountRate));
  return Math.floor((reward.value * (100 - discountRate)) / 100);
}

export function mapApiReward(api: RewardsApiResponse): Reward {
  return {
    id: api.id.toString(),
    name: api.name,
    description: api.description ?? '',
    type: api.type === 'POINT' ? RewardType.POINTS : RewardType.CUSTOM,
    value: api.point,
    discount: api.discount,
    discountRate: api.discountRate,
  };
}

// ─── API 함수 ─────────────────────────────────────────────────────────────────//

/** 활성 보상 목록 전체 조회 */
export async function fetchRewards(): Promise<Reward[]> {
  const res = await apiFetch(`${API_URL}/api/rewards/`);
  if (!res.ok) {
    throw new Error('보상 목록 조회 실패');
  }
  const json = await res.json();
  return ((json.data ?? []) as RewardsApiResponse[]).filter((r) => r.isActive).map(mapApiReward);
}

/** 보상 교환 (포인트 차감) */
export async function redeemReward(rewardId: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/api/user/rewards/${rewardId}/redeem`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('보상 교환 실패');
}

/** 내가 교환한 보상 전체 조회 */
export async function fetchOwnedRewards(): Promise<OwnedRewardApiResponse[]> {
  const response = await apiFetch(`${API_URL}/api/user/rewards`);
  if (!response.ok) {
    throw new Error('내 쿠폰을 불러오지 못했습니다.');
  }

  const body = (await response.json()) as { data?: OwnedRewardApiResponse[] };
  return body.data ?? [];
}

/** 보상을 사용 완료 상태로 변경 */
export async function markOwnedRewardUsed(id: number): Promise<OwnedRewardApiResponse> {
  const response = await apiFetch(`${API_URL}/api/user/rewards/${id}`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorBody?.message ?? '쿠폰 상태를 변경하지 못했습니다.');
  }

  const body = (await response.json()) as { data: OwnedRewardApiResponse };
  return body.data;
}
