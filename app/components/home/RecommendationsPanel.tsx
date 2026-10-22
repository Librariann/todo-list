'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, LoaderCircle, RefreshCw, X } from 'lucide-react';
import {
  RecommendationFrequency,
  RecommendationStatus,
  RecommendationType,
  type Recommendation,
  type RecommendationsResponse,
} from '@/app/types/recommendation';
import { getTodayDateString } from '@/app/lib/dateUtils';
import {
  acceptRecommendation,
  dismissRecommendation,
  fetchRecommendations,
  generateRecommendations,
} from '@/app/lib/recommendationsApi';
import { useAuthStore } from '@/app/store/authStore';
import { useCalendarStore } from '@/app/store/calendarStore';
import { useGoalsStore } from '@/app/store/goalsStore';
import { useHabitsStore } from '@/app/store/habitsStore';
import { useTodosStore } from '@/app/store/todosStore';

interface RecommendationsPanelProps {
  userId: number;
  onAccepted: (recommendation: Recommendation) => void;
}

const TYPE_LABELS: Record<RecommendationType, string> = {
  [RecommendationType.TODO]: '할 일',
  [RecommendationType.HABIT]: '습관',
  [RecommendationType.GOAL]: '목표',
};

const FREQUENCY_LABELS: Record<RecommendationFrequency, string> = {
  [RecommendationFrequency.DAILY]: '일',
  [RecommendationFrequency.WEEKLY]: '주',
  [RecommendationFrequency.MONTHLY]: '개월',
};

function describeSchedule(recommendation: Recommendation): string {
  const { payload, type } = recommendation;
  if (type === RecommendationType.HABIT) {
    return `매일 ${payload.dailyTarget ?? 1}${payload.unit || '회'}`;
  }
  if (type === RecommendationType.GOAL) {
    const period = FREQUENCY_LABELS[payload.recurrenceType ?? RecommendationFrequency.DAILY];
    return `${payload.interval ?? 1}${period}마다 ${payload.targetCount ?? 1}회 · ${payload.startDate} 시작`;
  }
  return payload.targetDate === getTodayDateString() ? '오늘 할 일' : `${payload.targetDate} 할 일`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : '추천을 불러오지 못했어요. 잠시 후 다시 시도해주세요.';
}

export default function RecommendationsPanel({ userId, onAccepted }: RecommendationsPanelProps) {
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [busyItemId, setBusyItemId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [nextAllowedAt, setNextAllowedAt] = useState<number>(0);
  const [now, setNow] = useState<number>(Date.now());
  const requestRef = useRef<AbortController | null>(null);
  const isBusyRef = useRef<boolean>(false);
  const remainingSeconds = Math.max(0, Math.ceil((nextAllowedAt - now) / 1000));
  const isCoolingDown = remainingSeconds > 0;
  const items = useMemo<Recommendation[]>(
    () =>
      (data?.items ?? [])
        .filter((item) => item.status !== RecommendationStatus.DISMISSED)
        .slice(0, 3),
    [data?.items]
  );
  const isBusy = isLoading || isGenerating || busyItemId !== null;

  useEffect(() => {
    const controller = new AbortController();
    requestRef.current = controller;
    fetchRecommendations(controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return;
        setData(response);
        setNextAllowedAt(Date.now() + response.retryAfterSeconds * 1000);
        setNow(Date.now());
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(errorMessage(cause));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => requestRef.current?.abort();
  }, [userId]);

  useEffect(() => {
    if (!isCoolingDown) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isCoolingDown]);

  const handleGenerate = async (): Promise<void> => {
    if (isBusyRef.current || isBusy || remainingSeconds > 0) return;
    isBusyRef.current = true;
    const controller = new AbortController();
    requestRef.current = controller;
    setIsGenerating(true);
    setError(null);
    setNotice(null);
    try {
      const response = await generateRecommendations(controller.signal);
      if (controller.signal.aborted) return;
      setData(response);
      setNextAllowedAt(Date.now() + response.retryAfterSeconds * 1000);
      setNow(Date.now());
    } catch (cause: unknown) {
      if (!controller.signal.aborted) {
        setError(errorMessage(cause));
        // A failed inference can still consume the server's generation allowance.
        try {
          const current = await fetchRecommendations(controller.signal);
          if (!controller.signal.aborted) {
            setData(current);
            setNextAllowedAt(Date.now() + current.retryAfterSeconds * 1000);
            setNow(Date.now());
          }
        } catch {
          // Keep the original error and existing recommendations available.
        }
      }
    } finally {
      isBusyRef.current = false;
      if (!controller.signal.aborted) setIsGenerating(false);
    }
  };

  const handleAction = async (recommendation: Recommendation, accept: boolean): Promise<void> => {
    if (isBusyRef.current || isBusy) return;
    isBusyRef.current = true;
    const controller = new AbortController();
    requestRef.current = controller;
    setBusyItemId(recommendation.id);
    setError(null);
    setNotice(null);
    try {
      const updated = await (accept ? acceptRecommendation : dismissRecommendation)(
        recommendation.id,
        controller.signal
      );
      if (controller.signal.aborted || useAuthStore.getState().user?.id !== userId) return;
      setData(
        (current) =>
          current && {
            ...current,
            items: current.items.map((item) => (item.id === updated.id ? updated : item)),
          }
      );
      if (accept) {
        // Refresh even after a repeated acceptance: the server returns the original item.
        const today = getTodayDateString();
        if (updated.type === RecommendationType.HABIT) {
          await useHabitsStore.getState().fetchHabits();
        } else if (updated.type === RecommendationType.GOAL) {
          const dates = new Set([today, updated.payload.startDate ?? today]);
          await Promise.all(
            [...dates].map((date) => useGoalsStore.getState().fetchGoals(date, true))
          );
        } else {
          await useTodosStore.getState().fetchTodos(updated.payload.targetDate ?? today);
        }
        if (controller.signal.aborted || useAuthStore.getState().user?.id !== userId) return;
        useCalendarStore.getState().invalidateMarks();
        setNotice(`${TYPE_LABELS[updated.type]}에 추가했어요.`);
        onAccepted(updated);
      } else {
        setNotice('다음 추천에 참고할게요.');
      }
    } catch (cause: unknown) {
      if (!controller.signal.aborted) setError(errorMessage(cause));
    } finally {
      isBusyRef.current = false;
      if (!controller.signal.aborted) setBusyItemId(null);
    }
  };

  const cooldownLabel =
    remainingSeconds >= 60
      ? `${Math.ceil(remainingSeconds / 60)}분 후 다시 추천받기`
      : `${remainingSeconds}초 후 다시 추천받기`;

  return (
    <section
      aria-labelledby="recommendations-heading"
      aria-busy={isBusy}
      className="mb-6 overflow-hidden rounded-[1.5rem] bg-[#e2eadb] px-4 py-5 text-[#26382b] dark:bg-muted dark:text-foreground @min-[28rem]/tasks:px-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 basis-52">
          <p className="text-xs font-bold text-[#4f6651] dark:text-muted-foreground">
            기록에서 찾은 다음 한 걸음
          </p>
          <h2
            id="recommendations-heading"
            className="friendly-heading mt-1 text-xl font-bold tracking-tight"
          >
            나에게 맞는 추천
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#4f6651] dark:text-muted-foreground">
            지난 기록을 바탕으로 최대 3개를 제안해요. 마음에 드는 것만 추가하세요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={isBusy || data?.available === false || remainingSeconds > 0}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#283f2e] px-4 py-2 text-sm font-bold text-[#f7faf3] transition-colors hover:bg-[#36543d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#283f2e] disabled:cursor-not-allowed disabled:opacity-55 dark:bg-primary dark:text-primary-foreground dark:focus-visible:outline-primary"
        >
          {isGenerating ? (
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin motion-reduce:animate-none"
            />
          ) : (
            <RefreshCw aria-hidden="true" className="size-4" />
          )}
          {isGenerating
            ? '기록 살펴보는 중'
            : remainingSeconds > 0
              ? cooldownLabel
              : data?.items.length
                ? '다시 추천받기'
                : '추천받기'}
        </button>
      </div>

      {isLoading ? (
        <p
          role="status"
          className="mt-5 flex items-center gap-2 text-sm text-[#4f6651] dark:text-muted-foreground"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin motion-reduce:animate-none"
          />{' '}
          지난 추천을 확인하고 있어요.
        </p>
      ) : null}

      {items.length > 0 ? (
        <ul className="mt-5 divide-y divide-[#283f2e]/15 border-t border-[#283f2e]/15 dark:divide-border dark:border-border">
          {items.map((item) => {
            const accepted = item.status === RecommendationStatus.ACCEPTED;
            return (
              <li
                key={item.id}
                className="flex min-w-0 flex-wrap items-start gap-x-5 gap-y-3 py-4 last:pb-0"
              >
                <div className="min-w-0 flex-1 basis-52">
                  <p className="text-xs font-bold text-[#4f6651] dark:text-muted-foreground">
                    {TYPE_LABELS[item.type]} · {describeSchedule(item)}
                  </p>
                  <h3 className="mt-1 break-words text-base font-bold">{item.title}</h3>
                  <p className="mt-1 break-words text-sm leading-6 text-[#4f6651] dark:text-muted-foreground">
                    {item.reason}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {accepted ? (
                    <span className="inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-bold">
                      <Check aria-hidden="true" className="size-4" />
                      추가했어요
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void handleAction(item, true)}
                        aria-label={`${item.title} ${TYPE_LABELS[item.type]}에 추가하기`}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#fbf8ef] px-4 text-sm font-bold transition-colors hover:bg-[#f1f5e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current disabled:cursor-not-allowed disabled:opacity-55 dark:bg-card dark:hover:bg-accent"
                      >
                        {busyItemId === item.id ? (
                          <LoaderCircle
                            aria-hidden="true"
                            className="size-4 animate-spin motion-reduce:animate-none"
                          />
                        ) : (
                          <ArrowRight aria-hidden="true" className="size-4" />
                        )}
                        추가하기
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void handleAction(item, false)}
                        aria-label={`${item.title} 추천 관심 없어요`}
                        title="관심 없어요"
                        className="inline-flex size-11 items-center justify-center rounded-full text-[#4f6651] transition-colors hover:bg-[#283f2e]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current disabled:cursor-not-allowed disabled:opacity-55 dark:text-muted-foreground dark:hover:bg-accent"
                      >
                        <X aria-hidden="true" className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : !isLoading && !error ? (
        <p className="mt-5 text-sm leading-6 text-[#4f6651] dark:text-muted-foreground">
          {data?.message ??
            (data?.items.length
              ? '마음에 드는 추천이 없었나요? 다음에는 다른 제안을 살펴보세요.'
              : '기록 속에서 이어갈 만한 일을 찾아볼까요? 추천받기를 눌러 시작하세요.')}
        </p>
      ) : null}

      {items.length > 0 && data?.message ? (
        <p className="mt-4 text-xs leading-5 text-[#4f6651] dark:text-muted-foreground">
          {data.message}
        </p>
      ) : null}
      {isGenerating ? (
        <p
          role="status"
          className="mt-4 text-sm leading-6 text-[#4f6651] dark:text-muted-foreground"
        >
          기록을 살펴보고 있어요. 처음에는 조금 더 걸릴 수 있어요.
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="mt-4 text-sm font-medium">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-4 text-sm leading-6 text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}
