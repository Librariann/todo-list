'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Gift,
  Repeat2,
  Target,
  Trophy,
} from 'lucide-react';
import ThemeToggleStandalone from '@/app/components/ThemeToggleStandalone';
import { useAuthStore } from '@/app/store/authStore';

const guides = [
  {
    number: '01',
    title: '습관 · 할 일 · 목표',
    description: '성격에 맞게 나누면 오늘 해야 할 일이 훨씬 가벼워져요.',
    items: [
      { icon: Repeat2, label: '습관', text: '매일 반복하고 싶은 행동을 횟수로 기록해요.' },
      { icon: Check, label: '할 일', text: '특정 날짜에 한 번 끝낼 일을 적어둬요.' },
      { icon: Target, label: '목표', text: '매일·매주·매월 정한 기간 안에 달성해요.' },
    ],
  },
  {
    number: '02',
    title: '날짜와 기록',
    description: '달력에서 날짜를 고르면 그날의 할 일과 목표 기록을 확인할 수 있어요.',
    items: [
      {
        icon: CalendarDays,
        label: '오늘과 미래',
        text: '오늘이나 미래의 할 일과 목표는 미리 등록할 수 있어요.',
      },
      {
        icon: Check,
        label: '완료 시점',
        text: '미래 항목은 당일이 되어야 완료할 수 있고, 지난 기록은 확인만 가능해요.',
      },
    ],
  },
  {
    number: '03',
    title: '기간 목표',
    description: '주간·월간 목표는 매일 체크하는 항목이 아니에요.',
    items: [
      {
        icon: Target,
        label: '기간 안에서 한 번',
        text: '해당 기간 중 어느 날에 완료해도 그 기간 전체가 달성 처리돼요.',
      },
      {
        icon: CalendarDays,
        label: '오늘의 흐름',
        text: '언제 완료할지 정해지지 않은 주간·월간 목표는 오늘의 흐름에서 제외돼요.',
      },
    ],
  },
  {
    number: '04',
    title: '챌린지와 포인트',
    description: '평소 기록을 이어가면 별도 조작 없이 챌린지가 진행돼요.',
    items: [
      {
        icon: Trophy,
        label: '자동 진행',
        text: '습관·할 일·목표를 완료하면 관련 챌린지 진행도가 자동으로 올라가요.',
      },
      {
        icon: Gift,
        label: '보상 교환',
        text: '달성으로 받은 포인트는 보상 화면에서 쿠폰으로 교환할 수 있어요.',
      },
    ],
  },
];

export default function GuidePage() {
  const router = useRouter();
  const userId = useAuthStore((auth) => auth.user?.id);

  const replayGettingStarted = () => {
    window.localStorage.removeItem(`growdo:onboarding:v2:${userId ?? 'user'}`);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#d9e1d5] px-3 py-3 dark:bg-background sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[1180px] overflow-hidden rounded-[2rem] bg-[#fbf8ef] text-[#26302a] shadow-[0_24px_70px_rgba(38,48,42,0.12)] dark:bg-card dark:text-foreground">
        <header className="flex min-h-20 items-center justify-between border-b border-border px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="GrowDo 홈">
            <Image
              src="/growdo-logo.png"
              alt=""
              width={38}
              height={38}
              className="size-9 rounded-xl"
            />
            <span className="friendly-heading text-xl font-bold tracking-[-0.06em]">GrowDo</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-4"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">오늘로 돌아가기</span>
            </Link>
            <ThemeToggleStandalone />
          </div>
        </header>

        <main>
          <section className="border-b border-border px-5 py-12 sm:px-10 sm:py-16 lg:px-16">
            <p className="text-xs font-bold tracking-[0.16em] text-primary">GROWDO GUIDE</p>
            <h1 className="friendly-heading mt-3 max-w-3xl text-4xl font-bold leading-[1.12] tracking-[-0.055em] sm:text-5xl">
              오늘 할 일을 가볍게,
              <br />한 걸음씩 이어가요
            </h1>
            <p className="mt-5 max-w-2xl break-keep text-sm leading-7 text-muted-foreground sm:text-base">
              GrowDo는 복잡한 계획표보다 오늘 실천할 한 가지에 집중해요. 아래 네 가지만 알면
              바로 시작할 수 있어요.
            </p>
          </section>

          <div className="divide-y divide-border px-5 sm:px-10 lg:px-16">
            {guides.map((guide) => (
              <section
                key={guide.number}
                className="grid gap-6 py-10 sm:py-12 lg:grid-cols-[8rem_minmax(0,0.8fr)_minmax(20rem,1.2fr)] lg:gap-10"
              >
                <p className="text-sm font-bold tabular-nums text-primary">{guide.number}</p>
                <div>
                  <h2 className="friendly-heading text-2xl font-bold tracking-[-0.04em] sm:text-3xl">
                    {guide.title}
                  </h2>
                  <p className="mt-3 break-keep text-sm leading-6 text-muted-foreground">
                    {guide.description}
                  </p>
                </div>
                <div className="divide-y divide-border border-y border-border">
                  {guide.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex gap-4 py-5">
                        <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                        <div>
                          <h3 className="text-sm font-bold">{item.label}</h3>
                          <p className="mt-1 break-keep text-sm leading-6 text-muted-foreground">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <section className="bg-[#28342d] px-5 py-10 text-[#f7f3e9] sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-16">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[#8ecb9f]">READY FOR TODAY</p>
              <h2 className="friendly-heading mt-2 text-2xl font-bold sm:text-3xl">
                이제 오늘 한 가지를 적어볼까요?
              </h2>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 lg:mt-0 lg:justify-end">
              <Link
                href="/support"
                className="inline-flex min-h-12 items-center rounded-full px-5 text-sm font-bold text-[#c9d8cd] transition-colors hover:bg-white/10 hover:text-white"
              >
                도움이 더 필요해요
              </Link>
              <button
                type="button"
                onClick={replayGettingStarted}
                className="min-h-12 rounded-full px-5 text-sm font-bold text-[#c9d8cd] transition-colors hover:bg-white/10 hover:text-white"
              >
                시작 안내 다시 보기
              </button>
              <Link
                href="/"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#3aa45f] px-6 text-sm font-bold text-white transition-colors hover:bg-[#319153]"
              >
                오늘 화면으로 가기
                <ArrowLeft className="size-4 rotate-180" />
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
