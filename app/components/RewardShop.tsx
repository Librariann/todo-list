'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Reward } from '../types/todo';
import { calculateRewardPoint, fetchRewards, redeemReward } from '../lib/rewardsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useUserSummaryStore } from '../store/userSummaryStore';

export default function RewardShop() {
  const router = useRouter();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const redeemingRef = useRef(false);
  const userPoints = useUserSummaryStore((state) => state.points);
  const adjustPoints = useUserSummaryStore((state) => state.adjustPoints);
  const refreshSummary = useUserSummaryStore((state) => state.refreshSummary);

  useEffect(() => {
    const getRewardList = async () => {
      const rewardRes = await fetchRewards();
      setRewards(rewardRes);
    };
    getRewardList();
  }, []);

  const openDialog = (reward: Reward) => {
    if (redeemingRef.current) return;
    setRedeemError(null);
    setSelectedReward(reward);
  };

  const closeDialog = () => {
    if (redeemingRef.current) return;
    setRedeemError(null);
    setSelectedReward(null);
  };

  const handleConfirmClaim = async () => {
    if (!selectedReward || redeemingRef.current) return;

    const reward = selectedReward;
    const purchasePoint = calculateRewardPoint(reward);

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
      await redeemReward(reward.id);
      await refreshSummary();
      setSelectedReward(null);
      toast.success(`${reward.name}을(를) 획득했습니다!`, {
        description: '내 쿠폰함에서 언제든 다시 확인할 수 있어요.',
        action: {
          label: '쿠폰함 보기',
          onClick: () => router.push('/coupons'),
        },
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
      <section>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="friendly-heading text-2xl font-bold">
              작은 기쁨을 골라봐요
            </CardTitle>
            <Badge className="rounded-full bg-secondary px-4 py-2 text-base font-bold text-secondary-foreground">
              {userPoints} P
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {rewards.map((reward) => {
              const purchasePoint = calculateRewardPoint(reward);
              const canAfford = userPoints >= purchasePoint;

              return (
                <Card
                  key={reward.id}
                  className={`
                    relative overflow-hidden rounded-[1.35rem] border transition-colors duration-200 shadow-none
                    ${
                      canAfford
                        ? 'border-primary/20 bg-card hover:border-primary/55'
                        : 'border-muted-foreground/20 bg-muted opacity-60'
                    }
                  `}
                >
                  {/* 정보 */}
                  <div className="mb-3 px-5 pt-5 text-left">
                    <h3 className="font-bold text-foreground mb-1">{reward.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {reward.description}
                    </p>
                  </div>

                  {/* 가격 */}
                  <div className="mb-3 flex min-h-7 items-center gap-2 px-5">
                    {reward.discount && reward.discountRate > 0 && (
                      <Badge className="rounded-full bg-[oklch(0.91_0.09_55)] text-[oklch(0.43_0.15_42)] shadow-none dark:bg-[oklch(0.31_0.07_45)] dark:text-[oklch(0.86_0.08_60)]">
                        {reward.discountRate}% 할인
                      </Badge>
                    )}
                    <span className="font-bold text-primary">
                      {purchasePoint.toLocaleString()} P
                    </span>
                    {purchasePoint !== reward.value && (
                      <span className="text-xs text-muted-foreground line-through">
                        {reward.value.toLocaleString()} P
                      </span>
                    )}
                  </div>

                  {/* 구매 버튼 */}
                  <div className="px-4 pb-4">
                    <Button
                      onClick={() => canAfford && openDialog(reward)}
                      disabled={!canAfford || isRedeeming}
                      className="w-full"
                      variant={canAfford ? 'default' : 'secondary'}
                    >
                      {canAfford ? '교환하기' : '포인트 부족'}
                    </Button>
                  </div>

                  {/* 부족한 포인트 표시 */}
                  {!canAfford && (
                    <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold">
                      {purchasePoint - userPoints} P 부족
                    </Badge>
                  )}
                </Card>
              );
            })}
          </div>

          {/* 더 많은 보상 추가 예정 메시지 */}
          <div className="mt-6 flex items-center justify-center rounded-2xl bg-[oklch(0.95_0.055_95)] p-4 dark:bg-muted">
            <p className="text-center text-sm text-muted-foreground">
              오늘의 완료가 다음 보상에 가까워지게 해요.
            </p>
          </div>
        </CardContent>
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
          onEscapeKeyDown={(event) => {
            if (isRedeeming) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (isRedeeming) event.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>보상을 교환할까요?</DialogTitle>
            <DialogDescription>
              {selectedReward
                ? `${selectedReward.name} 보상을 ${calculateRewardPoint(selectedReward).toLocaleString()}포인트로 교환합니다.`
                : '선택한 보상을 교환합니다.'}
            </DialogDescription>
          </DialogHeader>

          {selectedReward && (
            <div className="rounded-lg border bg-muted/50 px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">현재 포인트</span>
                <span className="font-semibold">{userPoints} P</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-muted-foreground">교환 포인트</span>
                <span className="font-semibold text-primary">
                  -{calculateRewardPoint(selectedReward).toLocaleString()} P
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 border-t pt-2">
                <span className="text-muted-foreground">교환 후 포인트</span>
                <span className="font-semibold text-foreground">
                  {(userPoints - calculateRewardPoint(selectedReward)).toLocaleString()} P
                </span>
              </div>
            </div>
          )}

          {redeemError ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {redeemError}
            </p>
          ) : null}

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={closeDialog} disabled={isRedeeming}>
              취소
            </Button>
            <Button onClick={() => void handleConfirmClaim()} disabled={isRedeeming}>
              {isRedeeming ? '교환 중...' : '확인'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
