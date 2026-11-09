'use client';

import { useState } from 'react';
import { Check, Coffee, Disc3, Moon, Waves } from 'lucide-react';

import { TodayTheme } from '@/app/hooks/useTodayTheme';
import { shopThemes, themeCatalog, type ShopTheme } from '@/app/lib/themeCatalog';
import { ChallengeCondition, ChallengeType, type Challenge } from '@/app/types/todo';
import NightObservatoryCover from '@/app/components/home/NightObservatoryCover';
import { CoastCover, StudioCover } from '@/app/components/home/TodaySkinCovers';
import nightStyles from '@/app/components/home/NightObservatory.module.css';
import skinStyles from '@/app/components/home/TodaySkins.module.css';
import ChallengeCard from '@/app/user/header/challenges/ChallengeCard';

const previewDate = '2026-11-09';

const exhibits = {
  [TodayTheme.Night]: { icon: Moon, cover: NightObservatoryCover, number: '01', style: nightStyles },
  [TodayTheme.Coast]: { icon: Waves, cover: CoastCover, number: '02', style: skinStyles },
  [TodayTheme.Studio]: { icon: Disc3, cover: StudioCover, number: '03', style: skinStyles },
};

const exampleChallenge: Challenge = {
  id: 'theme-preview',
  title: '이번 주 습관 이어가기',
  description: '내가 정한 습관을 다섯 번 실천해요.',
  type: ChallengeType.WEEKLY,
  condition: ChallengeCondition.COMPLETE_HABITS,
  targetCount: 5,
  currentCount: 3,
  rewardPoints: 50,
};

export default function ThemeShowroom() {
  const [theme, setTheme] = useState<ShopTheme>(TodayTheme.Night);
  const { label, description } = themeCatalog[theme];
  const { number, cover: Cover, style } = exhibits[theme];

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[19rem_minmax(0,1fr)]">
      <fieldset className="min-w-0">
        <legend className="mb-3 text-xs font-bold text-muted-foreground">테마 선택</legend>
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
          {shopThemes.map((option) => {
            const item = themeCatalog[option];
            const { icon: Icon } = exhibits[option];

            return (
              <label key={option} className="relative min-w-0 cursor-pointer">
                <input
                  type="radio"
                  name="showroom-theme"
                  value={option}
                  checked={theme === option}
                  onChange={() => setTheme(option)}
                  aria-labelledby={`theme-label-${option}`}
                  className="peer sr-only"
                />
                <span className="flex h-full min-h-20 flex-col items-start gap-2 rounded-xl border border-border bg-card p-2.5 transition-colors hover:bg-muted peer-checked:border-primary peer-checked:bg-secondary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring sm:p-3 lg:flex-row lg:items-center lg:gap-3 lg:px-4">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-md lg:size-10 ${item.swatch}`}>
                    <Icon aria-hidden="true" className="size-4 lg:size-5" />
                  </span>
                  <span className="grid min-w-0 gap-0.5">
                    <span id={`theme-label-${option}`} className="text-xs leading-snug font-bold break-keep sm:text-sm">{item.label}</span>
                    <span className="hidden text-xs leading-relaxed text-muted-foreground lg:block">{item.description}</span>
                  </span>
                </span>
                <Check aria-hidden="true" className="pointer-events-none absolute top-3 right-2 size-3.5 bg-secondary text-primary opacity-0 peer-checked:opacity-100 sm:right-3 lg:top-4" />
              </label>
            );
          })}
        </div>
      </fieldset>

      <section aria-labelledby="theme-preview-title" className="min-w-0">
        <div aria-live="polite" className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <h2 id="theme-preview-title" className="text-sm font-bold">
            <span aria-hidden="true" className="mr-2 font-semibold text-primary tabular-nums">{number} /</span>
            {label} 미리보기
          </h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        <div
          data-workspace-skin={theme}
          className={`@container min-w-0 overflow-hidden border border-border ${style.palette} ${style.layout} ${theme === TodayTheme.Coast ? 'rounded-2xl' : theme === TodayTheme.Night ? 'rounded-lg' : 'rounded-none'}`}
        >
          <div data-workspace-part="cover" data-section-cover="" className="px-3 pt-4 pb-5 @sm:px-6 @lg:px-8 [&_h3]:text-[clamp(1.4rem,6cqw,3.5rem)] [&_p]:text-xs @md:[&_p]:text-sm">
            <p data-workspace-part="cover-toolbar" className="border-b border-current/25 pb-2 font-semibold">오늘</p>
            <Cover date={previewDate} headingAs="h3" />
          </div>

          <div className="grid gap-4 p-3 @sm:p-5 @xl:grid-cols-2 @xl:p-6">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-bold text-muted-foreground">챌린지</p>
              <ChallengeCard challenge={exampleChallenge} />
            </div>
            <div className="min-w-0">
              <p className="mb-2 text-xs font-bold text-muted-foreground">보상</p>
              <div className={`flex min-h-[8.875rem] flex-wrap content-center items-center gap-3 border border-border bg-card p-4 ${theme === TodayTheme.Coast ? 'rounded-2xl' : 'rounded-md'}`}>
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                  <Coffee aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold break-keep">아메리카노 쿠폰</h3>
                  <p className="mt-1 text-sm font-bold text-primary tabular-nums">7,500 P</p>
                </div>
                <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">교환 가능</span>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">예시 화면이에요. 선택한 테마는 실제 화면에 적용되지 않아요.</p>
      </section>
    </div>
  );
}
