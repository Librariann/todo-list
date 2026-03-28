'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { apiFetch } from '@/app/lib/apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface RewardItem {
  id: number;
  name: string;
  type: 'COUPON' | 'POINT';
  point: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ChallengeItem {
  id: number;
  name: string;
  description: string;
  icon: string;
  recurrenceType: string;
  targetCount: number;
  point: number;
  isActive: boolean;
  achievedAt?: string;
}

interface StatsPanelProps {
  totalPoints: number; // fallback (local mock)
}

export default function StatsPanel({ totalPoints: fallbackPoints }: StatsPanelProps) {
  const { isAuthenticated } = useAuthStore();
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [serverPoints, setServerPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const [rewardsRes, challengesRes, pointsRes] = await Promise.all([
          apiFetch(`${API_URL}/api/user/rewards/`),
          apiFetch(`${API_URL}/api/user/challenges/achieved`),
          apiFetch(`${API_URL}/api/user/points/`),
        ]);

        if (rewardsRes.ok) {
          const rewardsData = await rewardsRes.json();
          setRewards((rewardsData.data ?? []).slice(0, 5));
        }

        if (challengesRes.ok) {
          const challengesData = await challengesRes.json();
          setChallenges((challengesData.data ?? []).slice(0, 5));
        }

        if (pointsRes.ok) {
          const data = await pointsRes.json();
          const pts = data.data;
          if (typeof pts === 'number') setServerPoints(pts);
        }
      } catch {
        // 네트워크 오류 시 빈 목록 유지
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isAuthenticated]);

  const displayPoints = serverPoints !== null ? serverPoints : fallbackPoints;

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  }

  function recurrenceLabel(type: string) {
    if (type === 'DAILY') return '일일';
    if (type === 'WEEKLY') return '주간';
    if (type === 'MONTHLY') return '월간';
    return type;
  }

  return (
    <div className="space-y-3">
      {/* 총 포인트 */}
      <div className="bg-white dark:bg-card rounded-xl px-5 py-4 border border-stone-200 dark:border-white/[0.07] shadow-sm">
        <p className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-1">
          총 포인트
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-stone-800 dark:text-white tabular-nums">
            {displayPoints.toLocaleString()}
          </span>
          <span className="text-sm text-stone-400 dark:text-stone-500 font-medium">pt</span>
        </div>
      </div>

      {/* 최근 받은 보상 */}
      <div className="bg-white dark:bg-card rounded-xl px-5 py-4 border border-stone-200 dark:border-white/[0.07] shadow-sm">
        <p className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-3">
          최근 받은 보상
        </p>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-stone-100 dark:bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : rewards.length === 0 ? (
          <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-2">
            받은 보상이 없습니다
          </p>
        ) : (
          <ul className="space-y-1.5">
            {rewards.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-stone-50 dark:bg-white/[0.04] border border-stone-100 dark:border-white/[0.05]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">{r.type === 'COUPON' ? '🎫' : '⭐'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate">
                      {r.name}
                    </p>
                    <p className="text-xs text-stone-400 dark:text-stone-500">
                      {r.type === 'COUPON' ? '쿠폰' : '포인트'} · {r.point.toLocaleString()}pt
                    </p>
                  </div>
                </div>
                <span className="text-xs text-stone-400 dark:text-stone-500 shrink-0">
                  {formatDate(r.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 최근 달성 도전과제 */}
      <div className="bg-white dark:bg-card rounded-xl px-5 py-4 border border-stone-200 dark:border-white/[0.07] shadow-sm">
        <p className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-3">
          최근 달성 도전과제
        </p>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-stone-100 dark:bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : challenges.length === 0 ? (
          <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-2">
            달성한 도전과제가 없습니다
          </p>
        ) : (
          <ul className="space-y-1.5">
            {challenges.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-stone-50 dark:bg-white/[0.04] border border-stone-100 dark:border-white/[0.05]"
              >
                <span className="text-base shrink-0">{c.icon || '🏆'}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate">
                    {c.name}
                  </p>
                  <p className="text-xs text-stone-400 dark:text-stone-500">
                    {recurrenceLabel(c.recurrenceType)} · {c.point}pt
                  </p>
                </div>
                {c.achievedAt && (
                  <span className="text-xs text-stone-400 dark:text-stone-500 shrink-0">
                    {formatDate(c.achievedAt)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
