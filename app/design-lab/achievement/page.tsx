'use client';

import { useEffect } from 'react';
import { ArrowLeft, BellRing, Layers3, Smartphone, Volume2 } from 'lucide-react';
import { notifyChallengeAchievements } from '@/app/lib/challengeNotifications';
import type { ChallengeAchievement } from '@/app/types/common';

const sampleAchievements: ChallengeAchievement[] = [
  {
    challengeId: 101,
    name: '오늘의 할 일 3개 완료',
    description: '오늘 계획한 할 일을 세 개 마쳤어요.',
    point: 120,
    periodType: 'DAILY',
    periodKey: '2026-09-07',
  },
  {
    challengeId: 102,
    name: '차근차근 목표 달성',
    description: '목표를 한 단계 더 진행했어요.',
    point: 80,
    periodType: 'WEEKLY',
    periodKey: '2026-W36',
  },
  {
    challengeId: 103,
    name: '꾸준한 습관 기록',
    description: '오늘의 습관을 빠짐없이 기록했어요.',
    point: 60,
    periodType: 'DAILY',
    periodKey: '2026-09-07',
  },
];

export default function AchievementDesignLabPage() {
  useEffect(() => {
    const previewTimer = window.setTimeout(() => {
      notifyChallengeAchievements(sampleAchievements.slice(0, 1));
    }, 450);

    return () => window.clearTimeout(previewTimer);
  }, []);

  return (
    <main className="min-h-screen bg-[#f3f2e9] px-5 py-8 text-[#1e3024] dark:bg-[#111a14] dark:text-[#edf5ee] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <a
          href="/design-lab"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#52705c] transition-colors hover:text-[#257c49] dark:text-[#a9bdad] dark:hover:text-emerald-300"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          디자인 실험실로 돌아가기
        </a>

        <section className="mt-12 grid gap-12 border-t border-[#1e3024]/20 pt-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-20 dark:border-white/15">
          <div>
            <p className="text-xs font-extrabold tracking-[0.12em] text-[#2b824d] dark:text-emerald-300">
              ACHIEVEMENT PREVIEW
            </p>
            <h1 className="friendly-heading mt-4 max-w-2xl text-[clamp(2.4rem,7vw,5rem)] font-black leading-[0.98] tracking-[-0.065em]">
              해낸 순간을
              <br />
              가볍게, 분명하게.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#657168] dark:text-[#afbeb2]">
              작업을 막는 모달 대신 잠깐 머물다 사라지는 달성 카드입니다. 실제 할 일·습관·목표 완료
              후와 동일하게 동작합니다.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => notifyChallengeAchievements(sampleAchievements.slice(0, 1))}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2f9255] px-6 text-sm font-extrabold text-white transition-colors hover:bg-[#267a47] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f9255] focus-visible:ring-offset-2 dark:ring-offset-[#111a14]"
              >
                <BellRing aria-hidden="true" className="size-4" />
                1개 달성 보기
              </button>
              <button
                type="button"
                onClick={() => notifyChallengeAchievements(sampleAchievements)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#1e3024]/25 px-6 text-sm font-extrabold transition-colors hover:border-[#2f9255] hover:bg-[#e4eddf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f9255] dark:border-white/20 dark:hover:bg-white/10"
              >
                <Layers3 aria-hidden="true" className="size-4" />
                여러 개 달성 보기
              </button>
            </div>
          </div>

          <aside className="border-t border-[#1e3024]/20 pt-7 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-1 dark:border-white/15">
            <Smartphone aria-hidden="true" className="size-6 text-[#2f9255]" />
            <h2 className="mt-4 text-lg font-extrabold">모바일에서는</h2>
            <p className="mt-3 text-sm leading-6 text-[#657168] dark:text-[#afbeb2]">
              하단 내비게이션 바로 위에 표시됩니다. 화면 폭을 줄인 뒤 버튼을 다시 누르면 실제 모바일
              배치를 확인할 수 있어요.
            </p>
            <div className="mt-7 flex items-start gap-3 border-t border-[#1e3024]/15 pt-6 dark:border-white/10">
              <Volume2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#2f9255]" />
              <p className="text-sm leading-6 text-[#657168] dark:text-[#afbeb2]">
                사운드는 브라우저 정책상 버튼을 눌렀을 때 가장 확실하게 들을 수 있어요.
              </p>
            </div>
            <div className="mt-7 flex items-center gap-3 text-xs font-bold text-[#52705c] dark:text-[#a9bdad]">
              <span className="h-px flex-1 bg-[#1e3024]/20 dark:bg-white/15" />
              5초 후 자동 닫힘
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
