import type { ReactNode } from 'react';
import { Moon, Sun, Sunrise, Sunset } from 'lucide-react';

import type { TimeGreeting } from '@/app/hooks/useTimeGreeting';
import type { MainTabType } from '@/app/types/navigation';
import NightObservatoryCover, { LunarChart } from '@/app/components/home/NightObservatoryCover';
import { CoastArtwork, CoastCover, StudioArtwork, StudioCover } from '@/app/components/home/TodaySkinCovers';
import { TodayTheme } from '@/app/hooks/useTodayTheme';

const sectionArtworks = {
  [TodayTheme.Default]: null,
  [TodayTheme.Night]: LunarChart,
  [TodayTheme.Coast]: CoastArtwork,
  [TodayTheme.Studio]: StudioArtwork,
};

interface HomeHeroProps {
  mainTab: MainTabType;
  selectedDateLabel: string;
  greeting: TimeGreeting;
  username?: string;
  theme: TodayTheme;
  themeDate: string;
  actions?: ReactNode;
}

export default function HomeHero({
  mainTab,
  selectedDateLabel,
  greeting,
  username,
  theme,
  themeDate,
  actions,
}: HomeHeroProps) {
  const title = mainTab === 'challenges' ? '이번 주도 가볍게 도전해요' : '나를 위한 보상';
  const isToday = mainTab === 'tasks';
  const hasTodayCover = isToday && theme !== TodayTheme.Default;
  const hasSectionCover = !isToday && theme !== TodayTheme.Default;
  const isNight = hasTodayCover && theme === TodayTheme.Night;
  const isCoast = hasTodayCover && theme === TodayTheme.Coast;
  const SectionArtwork = hasSectionCover ? sectionArtworks[theme] : null;

  const GreetingIcon =
    greeting.period === 'morning'
      ? Sunrise
      : greeting.period === 'afternoon'
        ? Sun
        : greeting.period === 'evening'
          ? Sunset
          : Moon;

  const greetingIconColor =
    greeting.period === 'morning'
      ? 'text-[#ee8d3d] dark:text-[#ffb36f]'
      : greeting.period === 'afternoon'
        ? 'text-[#e0a400] dark:text-[#ffd45a]'
        : greeting.period === 'evening'
          ? 'text-[#d9784a] dark:text-[#f1a173]'
          : 'text-[#7766b5] dark:text-[#b7a8f5]';

  const description =
    mainTab === 'tasks'
      ? '할 일부터 적어보고, 하나씩 가볍게 시작해요.'
      : mainTab === 'challenges'
        ? '평소 하던 일을 이어가면 자연스럽게 달성할 수 있어요.'
        : '꾸준히 모은 포인트로 오늘의 작은 기쁨을 골라보세요.';

  return (
    <div
      data-workspace-part="cover"
      data-section-cover={hasSectionCover ? '' : undefined}
      className={
        isNight
          ? 'overflow-hidden bg-[#111c28] px-4 pt-3 pb-5 text-[#f8eed7] sm:px-8 sm:pt-5 sm:pb-7 lg:px-12'
          : hasTodayCover
            ? 'overflow-hidden px-4 pt-3 pb-5 sm:px-8 sm:pt-5 sm:pb-7 lg:px-12'
            : hasSectionCover
              ? 'relative grid min-h-[13rem] grid-cols-[minmax(0,1fr)_minmax(4.5rem,27%)] items-center gap-3 overflow-hidden px-3 py-6 @min-[28rem]/workspace:min-h-[15rem] @min-[28rem]/workspace:gap-5 @min-[28rem]/workspace:px-6 @min-[48rem]/workspace:px-8'
              : 'relative flex min-h-[13rem] flex-col justify-end gap-5 px-3 pt-8 pb-5 @min-[28rem]/workspace:min-h-[15rem] @min-[28rem]/workspace:px-6 @min-[48rem]/workspace:px-8'
      }
    >
      <div data-tour={isToday ? 'home-hero' : undefined} className="relative z-10">
        <div
          data-workspace-part="cover-toolbar"
          className={`flex items-center justify-between gap-2 ${isNight ? 'border-b border-[#66727a] pb-3' : 'mb-3'}`}
        >
          {isNight ? (
            <p className="flex min-w-0 items-center gap-2 text-xs font-bold tracking-[0.11em] text-[#e9cb8e]">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rotate-45 border border-current"
              />
              개인 기록실
            </p>
          ) : hasTodayCover ? (
            <p className="min-w-0 text-xs font-bold tracking-[0.11em]">
              {isCoast ? '해안 산책로' : '그로우두 레코드 · A면'}
            </p>
          ) : (
            <p className={`min-w-0 text-sm font-semibold md:text-base ${hasSectionCover ? 'text-current' : 'text-[#2e8c54] dark:text-primary'}`}>
              {isToday ? selectedDateLabel : 'GrowDo'}
            </p>
          )}
          {actions}
        </div>
        {isNight ? (
          <NightObservatoryCover date={themeDate} username={username} />
        ) : isCoast ? (
          <CoastCover date={themeDate} />
        ) : hasTodayCover ? (
          <StudioCover date={themeDate} />
        ) : mainTab === 'tasks' ? (
          <h1 className="friendly-heading max-w-3xl font-normal leading-[1.22] tracking-[-0.06em] sm:leading-[1.18]">
            <span className="flex min-w-0 items-center gap-1 text-[clamp(1.1rem,4.5cqw,2.5rem)]">
              <span className="shrink-0">{greeting.message},</span>
              <span className="min-w-0 truncate" title={`${username || '사용자'}님`}>
                {username || '사용자'}님.
              </span>
              <GreetingIcon
                aria-hidden="true"
                className={`size-[0.82em] shrink-0 stroke-[1.8] sm:inline-block sm:align-[-0.08em] ${greetingIconColor}`}
              />
            </span>
            <span className="mt-1 block break-keep text-[clamp(1.1rem,4.5cqw,2.5rem)]">
              오늘 머물 곳을 정리해뒀어요.
            </span>
          </h1>
        ) : (
          <h1 className={`friendly-heading max-w-3xl break-keep text-[clamp(1.75rem,6cqw,3.5rem)] font-normal leading-[1.18] tracking-[-0.06em] ${hasSectionCover ? 'mt-4' : ''}`}>
            {title}
          </h1>
        )}
        {hasTodayCover ? null : (
          <p className={`mt-4 max-w-xl text-sm leading-6 sm:text-base md:text-lg md:leading-7 ${hasSectionCover ? 'text-current opacity-90' : 'text-muted-foreground'}`}>
            {description}
          </p>
        )}
      </div>
      {SectionArtwork ? (
        <div key={mainTab} aria-hidden="true" data-theme-section-artwork={theme} className="w-full min-w-0 max-w-84 justify-self-end [&_svg]:max-h-48">
          <SectionArtwork />
        </div>
      ) : null}
    </div>
  );
}
