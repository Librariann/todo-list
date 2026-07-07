'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, ChevronDown, CircleCheck, Clock3, Store, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ThemeToggleStandalone from '@/app/components/ThemeToggleStandalone';
import {
  fetchOwnedRewards,
  markOwnedRewardUsed,
  type OwnedRewardApiResponse,
} from '@/app/lib/rewardsApi';
import { useAuthStore } from '@/app/store/authStore';

type CouponFilter = 'available' | 'used';

const acquiredDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

function couponDate(value: string): string {
  return acquiredDateFormatter.format(new Date(value));
}

export default function CouponsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((auth) => auth.isAuthenticated);
  const user = useAuthStore((auth) => auth.user);
  const [mounted, setMounted] = useState(false);
  const [coupons, setCoupons] = useState<OwnedRewardApiResponse[]>([]);
  const [filter, setFilter] = useState<CouponFilter>('available');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [usingId, setUsingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    let active = true;
    setIsLoading(true);
    setLoadError(null);

    fetchOwnedRewards()
      .then((items) => {
        if (!active) return;
        console.log(items);
        setCoupons(items.filter((item) => item.type === 'POINT'));
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : '내 쿠폰을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, mounted, router]);

  const availableCount = useMemo(
    () => coupons.filter((coupon) => !coupon.isUsed).length,
    [coupons]
  );
  const usedCount = coupons.length - availableCount;
  const visibleCoupons = coupons.filter((coupon) =>
    filter === 'available' ? !coupon.isUsed : coupon.isUsed
  );

  const handleUseCoupon = async (coupon: OwnedRewardApiResponse) => {
    const snapshot = coupons;
    setUsingId(coupon.id);
    setCoupons((items) =>
      items.map((item) => (item.id === coupon.id ? { ...item, isUsed: true } : item))
    );

    try {
      const updated = await markOwnedRewardUsed(coupon.id);
      setCoupons((items) =>
        items.map((item) => (item.id === coupon.id ? { ...item, ...updated } : item))
      );
      setConfirmingId(null);
      setExpandedId(null);
      toast.success('사용한 쿠폰으로 옮겼어요.');
    } catch (error) {
      setCoupons(snapshot);
      toast.error(error instanceof Error ? error.message : '쿠폰 상태를 변경하지 못했습니다.');
    } finally {
      setUsingId(null);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#d9e1d5] dark:bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">쿠폰을 차곡차곡 꺼내고 있어요...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#d9e1d5] px-3 py-3 pb-8 dark:bg-background sm:px-6 sm:py-6">
      <div className="mx-auto min-h-[calc(100vh-3rem)] max-w-[1280px] overflow-hidden rounded-[2rem] bg-card shadow-[0_24px_70px_rgba(38,48,42,0.12)]">
        <header className="flex min-h-20 items-center justify-between border-b border-border px-5 sm:px-8">
          <Link href="/" className="friendly-heading text-2xl font-bold tracking-[-0.06em]">
            GrowDo
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">오늘로 돌아가기</span>
            </Link>
            <ThemeToggleStandalone />
          </div>
        </header>

        <main className="grid lg:grid-cols-[minmax(17rem,0.58fr)_minmax(0,1.42fr)]">
          <aside className="bg-[#28342d] px-7 py-10 text-[#f7f3e9] sm:px-10 sm:py-12 lg:min-h-[720px] lg:px-12">
            <div className="flex h-full flex-col justify-between gap-16">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-[#a9c7b3]">MY COUPONS</p>
                <h1 className="friendly-heading mt-4 text-4xl font-bold leading-[1.15] tracking-[-0.055em] sm:text-5xl">
                  모아둔 기쁨을
                  <br />
                  필요할 때 꺼내요.
                </h1>
                <p className="mt-5 max-w-sm text-sm leading-6 text-[#c9d5cd]">
                  {user?.username || '사용자'}님이 포인트로 교환한 쿠폰을 한곳에 모아뒀어요.
                </p>
              </div>

              <div className="border-t border-white/15 pt-6">
                <div className="flex items-end justify-between gap-5">
                  <div>
                    <span className="text-sm text-[#a9b8ae]">지금 쓸 수 있어요</span>
                    <strong className="friendly-heading mt-1 block text-5xl font-bold">
                      {availableCount}
                    </strong>
                  </div>
                  <Ticket className="mb-1 h-9 w-9 text-[#a9c7b3]" strokeWidth={1.5} />
                </div>
                <p className="mt-4 text-xs leading-5 text-[#a9b8ae]">
                  매장에서 사용한 뒤에는 직접 사용 완료로 옮겨주세요.
                </p>
              </div>
            </div>
          </aside>

          <section className="bg-[#fbf8ef] px-5 py-9 dark:bg-card sm:px-9 sm:py-12 lg:px-12">
            <div className="flex flex-col gap-5 border-b border-[#dfe3d8] pb-6 dark:border-border sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold tracking-[0.15em] text-[#2e8c54] dark:text-primary">
                  쿠폰 보관함
                </p>
                <h2 className="friendly-heading mt-2 text-3xl font-bold tracking-[-0.045em]">
                  내 쿠폰
                </h2>
              </div>
              <div className="flex w-fit rounded-full bg-[#e9ecdf] p-1 dark:bg-muted">
                <button
                  type="button"
                  onClick={() => setFilter('available')}
                  className={`min-h-10 rounded-full px-4 text-sm font-bold transition-colors ${
                    filter === 'available'
                      ? 'bg-[#fbf8ef] text-[#216c40] shadow-sm dark:bg-card dark:text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  사용 가능 {availableCount}
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('used')}
                  className={`min-h-10 rounded-full px-4 text-sm font-bold transition-colors ${
                    filter === 'used'
                      ? 'bg-[#fbf8ef] text-foreground shadow-sm dark:bg-card'
                      : 'text-muted-foreground'
                  }`}
                >
                  사용 완료 {usedCount}
                </button>
              </div>
            </div>

            {loadError ? (
              <div className="py-24 text-center">
                <h3 className="friendly-heading text-2xl font-bold">쿠폰을 불러오지 못했어요</h3>
                <p className="mt-3 text-sm text-muted-foreground">{loadError}</p>
                <Button className="mt-6 rounded-xl" onClick={() => window.location.reload()}>
                  다시 불러오기
                </Button>
              </div>
            ) : visibleCoupons.length === 0 ? (
              <div className="py-20 sm:py-24">
                <div className="max-w-md">
                  <Ticket className="h-8 w-8 text-[#7da58a]" strokeWidth={1.5} />
                  <h3 className="friendly-heading mt-5 text-2xl font-bold">
                    {filter === 'available'
                      ? '아직 꺼내볼 쿠폰이 없어요.'
                      : '사용한 쿠폰이 아직 없어요.'}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {filter === 'available'
                      ? '오늘의 일을 이어가며 모은 포인트로 첫 번째 작은 보상을 골라보세요.'
                      : '쿠폰을 사용하면 이곳에 차분히 모아둘게요.'}
                  </p>
                  {filter === 'available' ? (
                    <Link
                      href="/"
                      className="mt-6 inline-flex min-h-11 items-center font-bold text-primary"
                    >
                      포인트 보러 가기
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-6">
                {visibleCoupons.map((coupon) => {
                  const isExpanded = expandedId === coupon.id;
                  const isConfirming = confirmingId === coupon.id;

                  return (
                    <article
                      key={coupon.id}
                      className={`overflow-hidden rounded-[1.4rem] border transition-colors ${
                        coupon.isUsed
                          ? 'border-stone-200 bg-stone-100/65 dark:border-border dark:bg-muted/45'
                          : 'border-[#cddbc9] bg-[#fffdf7] dark:border-primary/20 dark:bg-card'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedId(isExpanded ? null : coupon.id);
                          setConfirmingId(null);
                        }}
                        className="grid min-h-28 w-full text-left sm:grid-cols-[minmax(0,1fr)_9.5rem]"
                        aria-expanded={isExpanded}
                      >
                        <span className="flex min-w-0 items-center gap-4 px-5 py-5 sm:px-6">
                          <span
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                              coupon.isUsed
                                ? 'bg-stone-200 text-stone-500 dark:bg-background'
                                : 'bg-[#e4eddf] text-[#216c40] dark:bg-secondary dark:text-primary'
                            }`}
                          >
                            {coupon.isUsed ? (
                              <CircleCheck className="h-5 w-5" />
                            ) : (
                              <Store className="h-5 w-5" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-bold text-foreground">
                              {coupon.name}
                            </span>
                            <span className="mt-1 block truncate text-sm text-muted-foreground">
                              {coupon.description || '기분 좋은 순간에 사용해보세요.'}
                            </span>
                          </span>
                        </span>

                        <span className="relative flex items-center justify-between gap-3 border-t border-dashed border-stone-300 px-5 py-4 sm:border-l sm:border-t-0 dark:border-border">
                          <span>
                            <span
                              className={`block text-xs font-bold ${
                                coupon.isUsed
                                  ? 'text-muted-foreground'
                                  : 'text-[#2e8c54] dark:text-primary'
                              }`}
                            >
                              {coupon.isUsed ? '사용 완료' : '사용 가능'}
                            </span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {coupon.point.toLocaleString()} P
                            </span>
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </span>
                      </button>

                      <div
                        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="border-t border-stone-200 px-5 py-5 dark:border-border sm:px-6">
                            <dl className="grid gap-4 text-sm sm:grid-cols-2">
                              <div>
                                <dt className="text-xs text-muted-foreground">교환한 날</dt>
                                <dd className="mt-1 font-semibold">
                                  {couponDate(coupon.createdAt)}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs text-muted-foreground">사용 포인트</dt>
                                <dd className="mt-1 font-semibold">
                                  {coupon.point.toLocaleString()} P
                                </dd>
                              </div>
                            </dl>

                            {!coupon.isUsed ? (
                              <div className="mt-5 rounded-2xl bg-[#eef0e7] px-4 py-4 dark:bg-muted">
                                {coupon.couponImageUrl || coupon.couponCode ? (
                                  <div>
                                    <p className="text-sm font-bold">매장에서 보여주세요</p>
                                    {coupon.couponImageUrl ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={coupon.couponImageUrl}
                                        alt={`${coupon.name} 모바일 쿠폰`}
                                        className="mt-4 max-h-80 w-full rounded-xl object-contain"
                                      />
                                    ) : null}
                                    {coupon.couponCode ? (
                                      <p className="mt-3 break-all text-center text-sm font-bold tracking-[0.12em]">
                                        {coupon.couponCode}
                                      </p>
                                    ) : null}
                                  </div>
                                ) : (
                                  <div className="flex gap-3">
                                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#6f8074]" />
                                    <div>
                                      <p className="text-sm font-bold">
                                        쿠폰 발급 정보를 준비 중이에요
                                      </p>
                                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        기프티쇼 연동 후 바코드와 유효기간이 이 자리에 표시돼요.
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : null}

                            {!coupon.isUsed && !isConfirming ? (
                              <div className="mt-5 flex justify-end">
                                <Button
                                  variant="outline"
                                  className="h-11 rounded-xl"
                                  onClick={() => setConfirmingId(coupon.id)}
                                >
                                  <Check className="h-4 w-4" />
                                  사용 완료로 표시
                                </Button>
                              </div>
                            ) : null}

                            {isConfirming ? (
                              <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-[#f6eadb] px-4 py-4 dark:bg-[oklch(0.29_0.035_55)] sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-sm font-bold">이 쿠폰을 사용했나요?</p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    사용 완료로 옮기면 다시 되돌릴 수 없어요.
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    className="h-10 rounded-xl"
                                    onClick={() => setConfirmingId(null)}
                                    disabled={usingId === coupon.id}
                                  >
                                    아니요
                                  </Button>
                                  <Button
                                    className="h-10 rounded-xl"
                                    onClick={() => handleUseCoupon(coupon)}
                                    disabled={usingId === coupon.id}
                                  >
                                    {usingId === coupon.id ? '옮기는 중...' : '사용했어요'}
                                  </Button>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
