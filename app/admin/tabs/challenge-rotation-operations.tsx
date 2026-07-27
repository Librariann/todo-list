'use client';

import { useCallback, useEffect, useState } from 'react';
import ConfirmModal from '@/app/components/ConfirmModal';
import { apiFetch } from '@/app/lib/apiClient';
import {
  ChallengeRotationPreview,
  ChallengeRotationRun,
  ChallengeRotationTrigger,
  RecurrenceType,
  WorkType,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const periodLabel: Record<RecurrenceType, string> = {
  DAILY: '일일',
  WEEKLY: '주간',
  MONTHLY: '월간',
};

const triggerLabel: Record<ChallengeRotationTrigger, string> = {
  CRON: '정기 선발',
  LAZY: '접속 시 복구',
  MANUAL: '수동 재선발',
  LEGACY: '기존 선발',
};

const workTypeLabel: Record<WorkType, string> = {
  HABITS: '습관',
  TODOS: '할 일',
  GOALS: '목표',
};

interface ChallengeRotationOperationsProps {
  periodType: RecurrenceType;
  onRerolled: () => void | Promise<void>;
}

async function responseError(response: Response, fallback: string): Promise<Error> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    const message = Array.isArray(body.message) ? body.message[0] : body.message;
    return new Error(message || fallback);
  } catch {
    return new Error(fallback);
  }
}

function formatRunDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatPeriodKey(value: string): string {
  return value.replaceAll('-', '.');
}

export default function ChallengeRotationOperations({
  periodType,
  onRerolled,
}: ChallengeRotationOperationsProps) {
  const [history, setHistory] = useState<ChallengeRotationRun[]>([]);
  const [preview, setPreview] = useState<ChallengeRotationPreview | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await apiFetch(
        `${API_URL}/api/challenges/rotation-history/${periodType}?limit=10`
      );
      if (!response.ok) throw await responseError(response, '운영 이력을 불러오지 못했어요.');
      const body = (await response.json()) as { data?: ChallengeRotationRun[] };
      setHistory(body.data ?? []);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : '운영 이력을 불러오지 못했어요.');
    } finally {
      setLoadingHistory(false);
    }
  }, [periodType]);

  useEffect(() => {
    setPreview(null);
    setFeedback(null);
    void fetchHistory();
  }, [fetchHistory]);

  async function handlePreview() {
    setLoadingPreview(true);
    setFeedback(null);
    try {
      const response = await apiFetch(
        `${API_URL}/api/challenges/rotation-preview/${periodType}`,
        { method: 'POST' }
      );
      if (!response.ok) throw await responseError(response, '미리보기를 만들지 못했어요.');
      const body = (await response.json()) as { data: ChallengeRotationPreview };
      setPreview(body.data);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : '미리보기를 만들지 못했어요.');
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleReroll() {
    if (!preview) return;
    const response = await apiFetch(
      `${API_URL}/api/challenges/rotation-reroll/${periodType}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeIds: preview.candidates.map(({ id }) => id) }),
      }
    );
    if (!response.ok) throw await responseError(response, '재선발하지 못했어요.');

    setPreview(null);
    setFeedback('미리 본 조합으로 현재 기간의 노출을 바꿨어요.');
    await Promise.all([fetchHistory(), onRerolled()]);
  }

  return (
    <section className="grid gap-4 border-y border-stone-200 py-5 dark:border-white/[0.08] lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]">
      <div className="min-w-0 lg:border-r lg:border-stone-200 lg:pr-5 dark:lg:border-white/[0.08]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-primary">수동 운영</p>
            <h3 className="friendly-heading mt-1 text-lg font-bold text-foreground">
              다음 조합을 먼저 확인해요
            </h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              미리보기는 노출을 바꾸지 않아요. 진행 기록이 생긴 기간은 재선발할 수 없어요.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePreview}
            disabled={loadingPreview}
            className="min-h-11 rounded-xl border border-primary/25 bg-primary/5 px-4 text-sm font-bold text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
          >
            {loadingPreview ? '고르는 중' : preview ? '다른 조합 보기' : '재선발 미리보기'}
          </button>
        </div>

        {preview ? (
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-muted-foreground">
                {formatPeriodKey(preview.periodKey)} · {preview.candidates.length}/
                {preview.requestedCount}개
              </p>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={preview.candidates.length === 0}
                className="min-h-11 rounded-xl bg-foreground px-4 text-sm font-bold text-background transition-opacity hover:opacity-85 disabled:opacity-30"
              >
                이 조합으로 변경
              </button>
            </div>
            <ol className="divide-y divide-stone-200 rounded-2xl bg-[oklch(0.975_0.014_145)] px-4 dark:divide-white/[0.07] dark:bg-primary/5">
              {preview.candidates.map((candidate, index) => (
                <li key={candidate.id} className="flex min-h-14 items-center gap-3 py-2.5">
                  <span className="w-5 text-center text-xs font-bold text-primary">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                    {candidate.name}
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {workTypeLabel[candidate.workType]}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="mt-5 flex min-h-28 items-center rounded-2xl bg-stone-50 px-5 text-sm leading-6 text-muted-foreground dark:bg-white/[0.03]">
            현재 쿨다운과 작업 유형 균형을 적용한 새 조합을 여기에서 확인할 수 있어요.
          </div>
        )}

        {feedback ? (
          <p role="status" className="mt-3 text-xs font-semibold text-primary">
            {feedback}
          </p>
        ) : null}
      </div>

      <div className="min-w-0 lg:pl-1">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">최근 실행</p>
          <h3 className="friendly-heading mt-1 text-lg font-bold text-foreground">
            {periodLabel[periodType]} 운영 기록
          </h3>
        </div>

        {loadingHistory ? (
          <div className="mt-4 space-y-2">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-14 animate-pulse rounded-xl bg-stone-100 dark:bg-white/5" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-stone-50 px-4 py-6 text-sm text-muted-foreground dark:bg-white/[0.03]">
            아직 기록된 선발 실행이 없어요. 다음 자동 선발부터 차곡차곡 남겨둘게요.
          </p>
        ) : (
          <ol className="mt-4 space-y-1">
            {history.map((run) => (
              <li key={run.id} className="grid grid-cols-[0.7rem_minmax(0,1fr)_auto] gap-3 py-2.5">
                <span
                  className={`mt-1.5 h-2 w-2 rounded-full ${
                    run.status === 'SUCCESS' ? 'bg-primary' : 'bg-red-500'
                  }`}
                  aria-label={run.status === 'SUCCESS' ? '성공' : '실패'}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {triggerLabel[run.trigger]} · {run.selectedCount}/{run.requestedCount}개
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {formatPeriodKey(run.periodKey)}
                    {run.message ? ` · ${run.message}` : ''}
                  </p>
                </div>
                <time className="pt-0.5 text-[11px] text-muted-foreground">
                  {formatRunDate(run.createdAt)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={`${periodLabel[periodType]} 도전과제를 다시 선발할까요?`}
        description="현재 노출 중인 도전과제를 미리 본 조합으로 교체해요."
        warning="사용자 진행 기록이 하나라도 있으면 변경하지 않고 안전하게 중단해요."
        confirmLabel="재선발하기"
        pendingLabel="재선발하는 중..."
        onOpenChange={setConfirmOpen}
        onConfirm={handleReroll}
      />
    </section>
  );
}
