'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock3, Coffee, PackageOpen, PauseCircle, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { calculateRewardPoint, fetchRewards, redeemReward } from '../lib/rewardsApi';
import { useUserSummaryStore } from '../store/userSummaryStore';
import { Reward, RewardType } from '../types/todo';

const openDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: 'long',
  day: 'numeric',
});

type Availability = {
  available: boolean;
  label: string;
  detail: string;
  tone: 'green' | 'amber' | 'stone';
};

function availabilityOf(reward: Reward): Availability {
  if (!reward.exchangeEnabled) {
    return {
      available: false,
      label: '잠시 쉬어가요',
      detail: '운영 준비가 끝나면 다시 열릴 예정이에요.',
      tone: 'stone',
    };
  }

  if (reward.availableFrom) {
    const opensAt = new Date(reward.availableFrom);
    if (opensAt.getTime() > Date.now()) {
      const remainingDays = Math.max(
        1,
        Math.ceil((opensAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      );
      return {
        available: false,
        label: `D-${remainingDays}`,
        detail: `${openDateFormatter.format(opensAt)}부터 교환할 수 있어요.`,
        tone: 'amber',
      };
    }
  }

  const requiresStock = reward.type !== RewardType.POINTS;

  if (requiresStock && reward.stockQuantity <= 0) {
    return {
      available: false,
      label: '다시 채우는 중',
      detail: '다음 쿠폰을 준비하고 있어요.',
      tone: 'stone',
    };
  }

  return {
    available: true,
    label: '지금 교환 가능',
    detail: '모은 포인트로 작은 기쁨을 만나보세요.',
    tone: 'green',
  };
}

function RewardVisual({ reward, unavailable }: { reward: Reward; unavailable: boolean }) {
  if (reward.imageUrl) {
    return (
      <div
        role="img"
        aria-label={`${reward.name} 상품 이미지`}
        className="h-52 bg-[#fffdf7] bg-contain bg-center bg-no-repeat dark:bg-card sm:h-64"
        style={{ backgroundImage: `url("${reward.imageUrl.replaceAll('"', '\\"')}")` }}
      />
    );
  }

  return (
    <div className="relative flex h-full min-h-52 items-center justify-center overflow-hidden bg-[#dfece3] sm:min-h-64">
      <span className="absolute -left-8 top-8 h-28 w-28 rounded-full border border-[#b8d0c0]" />
      <span className="absolute -bottom-12 -right-8 h-40 w-40 rounded-full bg-[#c9ddce]" />
      <div className="relative flex h-32 w-24 items-center justify-center rounded-b-[2.5rem] rounded-t-2xl bg-[#39473f] shadow-[0_18px_35px_rgba(45,59,51,0.2)]">
        <div className="absolute -top-2 h-4 w-20 rounded-full bg-[#eff5eb]" />
        <Coffee className="h-10 w-10 text-[#e9f0e6]" strokeWidth={1.4} />
      </div>
      {!unavailable && (
        <span className="absolute bottom-5 left-5 text-[10px] font-bold tracking-[0.18em] text-[#66806f]">
          A SMALL REWARD
        </span>
      )}
    </div>
  );
}

interface RewardShopProps {
  previewRewards?: Reward[];
  previewPoints?: number;
  previewOnly?: boolean;
}

export default function RewardShop({
  previewRewards,
  previewPoints,
  previewOnly = false,
}: RewardShopProps = {}) {
  const router = useRouter();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const redeemingRef = useRef(false);
  const idempotencyKeyRef = useRef<string | null>(null);
  const storedPoints = useUserSummaryStore((state) => state.points);
  const userPoints = previewPoints ?? storedPoints;
  const adjustPoints = useUserSummaryStore((state) => state.adjustPoints);
  const refreshSummary = useUserSummaryStore((state) => state.refreshSummary);

  useEffect(() => {
    if (previewRewards) {
      setRewards(previewRewards);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    fetchRewards()
      .then((items) => {
        if (!active) return;
        setRewards(items);
        setLoadError(null);
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : '보상을 불러오지 못했어요.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [previewRewards]);

  const openDialog = (reward: Reward) => {
    if (redeemingRef.current || !availabilityOf(reward).available) return;
    idempotencyKeyRef.current = crypto.randomUUID();
    setRedeemError(null);
    setSelectedReward(reward);
  };

  const closeDialog = () => {
    if (redeemingRef.current) return;
    idempotencyKeyRef.current = null;
    setRedeemError(null);
    setSelectedReward(null);
  };

  const handleConfirmClaim = async () => {
    if (!selectedReward || redeemingRef.current) return;

    const reward = selectedReward;
    if (previewOnly) {
      setSelectedReward(null);
      toast.info('디자인 미리보기에서는 실제 교환이 진행되지 않아요.');
      return;
    }

    const purchasePoint = calculateRewardPoint(reward);
    const idempotencyKey = idempotencyKeyRef.current ?? crypto.randomUUID();
    idempotencyKeyRef.current = idempotencyKey;

    if (userPoints < purchasePoint) {
      const message = '포인트가 부족합니다. 포인트를 모아주세요.';
      setRedeemError(message);
      toast.error(message);
      return;
    }

    redeemingRef.current = true;
    setIsRedeeming(true);
    setRedeemError(null);
    adjustPoints(-purchasePoint);

    try {
      await redeemReward(reward.id, idempotencyKey);
      await refreshSummary();
      setRewards((items) =>
        items.map((item) =>
          item.id === reward.id
            ? { ...item, stockQuantity: Math.max(0, item.stockQuantity - 1) }
            : item
        )
      );
      idempotencyKeyRef.current = null;
      setSelectedReward(null);
      toast.success(`${reward.name}을(를) 획득했습니다!`, {
        description: '내 쿠폰함에서 언제든 다시 확인할 수 있어요.',
        action: { label: '쿠폰함 보기', onClick: () => router.push('/coupons') },
      });
    } catch (error) {
      adjustPoints(purchasePoint);
      const message = error instanceof Error ? error.message : '보상을 교환하지 못했습니다.';
      setRedeemError(message);
      toast.error(message);
    } finally {
      redeemingRef.current = false;
      setIsRedeeming(false);
    }
  };

  return (
    <>
      <section className="overflow-hidden">
        <div className="grid border-b border-[#d9e1d6] bg-[#f4f1e7] dark:border-border dark:bg-card lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="px-5 py-8 sm:px-8 sm:py-10">
            <p className="text-[11px] font-bold tracking-[0.17em] text-[#64806e] dark:text-primary">
              GROWDO REWARD SHELF
            </p>
            <h2 className="friendly-heading mt-3 max-w-lg text-3xl font-bold leading-[1.2] tracking-[-0.045em] sm:text-4xl">
              오늘의 꾸준함을
              <br />
              작은 기쁨으로 바꿔요.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
              미리 둘러보고 천천히 모아도 괜찮아요. <br />
              나를 위한 작은 선물을 골라보세요.
            </p>
          </div>
          <div className="bg-[#2c3931] px-6 py-7 text-[#f6f2e8] sm:px-8">
            <div className="flex items-end justify-between gap-6 lg:flex-col lg:items-start lg:gap-8">
              <Ticket className="h-8 w-8 text-[#a8c9b1]" strokeWidth={1.4} />
              <div>
                <span className="text-xs text-[#adbbb1]">내가 모은 포인트</span>
                <strong className="friendly-heading mt-1 block text-3xl font-bold">
                  {userPoints.toLocaleString()} P
                </strong>
              </div>
            </div>
            <Link
              href="/coupons"
              className="mt-6 inline-flex min-h-11 w-full items-center justify-between rounded-xl border border-[#718178] bg-[#34443b] px-4 text-sm font-bold text-[#f6f2e8] outline-none transition-colors hover:bg-[#405248] focus-visible:ring-2 focus-visible:ring-[#b9d7c2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2c3931]"
            >
              <span>내 쿠폰함 가기</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="px-4 py-6 sm:px-7 sm:py-8">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[0, 1].map((item) => (
                <div key={item} className="h-[25rem] animate-pulse rounded-[1.5rem] bg-muted" />
              ))}
            </div>
          ) : loadError ? (
            <div className="py-20 text-center">
              <PackageOpen className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="friendly-heading mt-4 text-xl font-bold">보상 선반을 열지 못했어요</h3>
              <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rewards.map((reward) => {
                const purchasePoint = calculateRewardPoint(reward);
                const availability = availabilityOf(reward);
                const unavailable = !availability.available;
                const canAfford = userPoints >= purchasePoint;
                const canExchange = availability.available && canAfford;

                return (
                  <article
                    key={reward.id}
                    className={`group grid overflow-hidden rounded-[1.5rem] border transition-colors ${
                      unavailable
                        ? 'border-[#d4d2c9] bg-[#f2f1eb] dark:border-border dark:bg-muted/35'
                        : 'border-[#d5ddd3] bg-[#fffdf7] hover:border-[#9fbaa7] dark:border-border dark:bg-card dark:hover:border-primary/45'
                    }`}
                  >
                    <div className="relative min-h-52 overflow-hidden">
                      <div className={unavailable ? 'opacity-60 grayscale dark:opacity-40' : ''}>
                        <RewardVisual reward={reward} unavailable={unavailable} />
                      </div>
                      {unavailable && (
                        <>
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent,transparent_9px,rgba(86,83,69,0.07)_9px,rgba(86,83,69,0.07)_10px)] dark:bg-[repeating-linear-gradient(135deg,transparent,transparent_9px,rgba(237,232,215,0.06)_9px,rgba(237,232,215,0.06)_10px)]"
                          />
                          <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#d4d2c9] bg-[#f6f4ed] px-4 py-2 text-xs font-semibold text-[#59594f] dark:border-[#66695c] dark:bg-[#30362d] dark:text-[#eeeade]">
                              <PauseCircle aria-hidden="true" className="size-4 shrink-0" />
                              지금은 교환할 수 없어요
                            </span>
                          </div>
                        </>
                      )}
                      <Badge
                        className={`absolute left-4 top-4 rounded-full border-0 px-3 py-1 shadow-none ${
                          availability.tone === 'green'
                            ? 'bg-[#275f40] text-[#f2f6ef]'
                            : availability.tone === 'amber'
                              ? 'bg-[#f4dfae] text-[#70521d]'
                              : 'bg-[#e4e1d6] text-[#59594f] dark:bg-[#40463b] dark:text-[#eeeade]'
                        }`}
                      >
                        {availability.label}
                      </Badge>
                    </div>

                    <div className="flex min-h-48 flex-col px-5 pb-5 pt-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="friendly-heading line-clamp-2 break-words text-xl font-bold leading-snug tracking-[-0.035em]">
                            {reward.name}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                            {reward.description}
                          </p>
                        </div>
                        {reward.discount && reward.discountRate > 0 ? (
                          <span
                            className={`shrink-0 text-sm font-bold ${unavailable ? 'text-muted-foreground' : 'text-[#d2643d]'}`}
                          >
                            -{reward.discountRate}%
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock3 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                        <span>{availability.detail}</span>
                      </div>

                      <div className="mt-auto flex flex-col items-stretch gap-3 pt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                        <div className="min-w-0">
                          <strong
                            className={`text-lg font-extrabold ${unavailable ? 'text-muted-foreground' : 'text-[#287148] dark:text-primary'}`}
                          >
                            {purchasePoint.toLocaleString()} P
                          </strong>
                          {purchasePoint !== reward.value ? (
                            <span className="ml-2 text-xs text-muted-foreground line-through">
                              {reward.value.toLocaleString()} P
                            </span>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          onClick={() => openDialog(reward)}
                          disabled={!canExchange || isRedeeming}
                          className={`min-h-11 w-full rounded-xl sm:w-auto sm:min-w-28 ${unavailable ? 'border border-[#d4d2c9] bg-[#e5e3d9] text-[#65655a] disabled:opacity-100 dark:border-[#555d4d] dark:bg-[#353d30] dark:text-[#cbcdbf]' : ''}`}
                          variant={canExchange ? 'default' : 'secondary'}
                        >
                          {!availability.available
                            ? availability.label
                            : canAfford
                              ? '교환하기'
                              : `${(purchasePoint - userPoints).toLocaleString()} P 부족`}
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Dialog
        open={Boolean(selectedReward)}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent
          className="w-full max-w-sm"
          showCloseButton={!isRedeeming}
          onEscapeKeyDown={(event) => isRedeeming && event.preventDefault()}
          onPointerDownOutside={(event) => isRedeeming && event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="friendly-heading text-xl">이 기쁨을 꺼내볼까요?</DialogTitle>
            <DialogDescription>
              {selectedReward
                ? `${selectedReward.name}을(를) ${calculateRewardPoint(selectedReward).toLocaleString()}포인트로 교환합니다.`
                : '선택한 보상을 교환합니다.'}
            </DialogDescription>
          </DialogHeader>

          {selectedReward ? (
            <div className="rounded-xl bg-[#f1f3eb] px-4 py-3 text-sm dark:bg-muted/60">
              <div className="flex justify-between gap-3 text-muted-foreground">
                <span>현재 포인트</span>
                <span className="font-semibold text-foreground">
                  {userPoints.toLocaleString()} P
                </span>
              </div>
              <div className="mt-2 flex justify-between gap-3 border-t border-border/60 pt-2">
                <span className="text-muted-foreground">교환 후</span>
                <span className="font-bold text-[#287148] dark:text-primary">
                  {(userPoints - calculateRewardPoint(selectedReward)).toLocaleString()} P
                </span>
              </div>
            </div>
          ) : null}

          {redeemError ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {redeemError}
            </p>
          ) : null}

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={closeDialog} disabled={isRedeeming}>
              조금 더 생각할게요
            </Button>
            <Button onClick={() => void handleConfirmClaim()} disabled={isRedeeming}>
              {isRedeeming ? '교환 중...' : '교환하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
