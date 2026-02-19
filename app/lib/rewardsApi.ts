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

// ─── 매퍼 ────────────────────────────────────────────────────────────────────

function iconFromType(type: 'COUPON' | 'POINT'): string {
  return type === 'COUPON' ? '🎫' : '⭐';
}

export function mapApiReward(api: RewardsApiResponse): Reward {
  return {
    id: api.id.toString(),
    name: api.name,
    description: api.description ?? '',
    type: api.type === 'POINT' ? RewardType.POINTS : RewardType.CUSTOM,
    value: api.point,
    iconUrl: iconFromType(api.type),
  };
}

// ─── API 함수 ─────────────────────────────────────────────────────────────────

/** 활성 보상 목록 전체 조회 */
export async function fetchRewards(): Promise<Reward[]> {
  const res = await apiFetch(`${API_URL}/api/rewards/`);
  if (!res.ok) throw new Error('보상 목록 조회 실패');
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
