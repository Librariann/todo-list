import { Moon, Sun, Sunrise, Sunset } from 'lucide-react';

import type { TimeGreeting } from '@/app/hooks/useTimeGreeting';
import type { MainTabType } from '@/app/types/navigation';

interface HomeHeroProps {
  mainTab: MainTabType;
  selectedDateLabel: string;
  greeting: TimeGreeting;
  username?: string;
}

export default function HomeHero({
  mainTab,
  selectedDateLabel,
  greeting,
  username,
}: HomeHeroProps) {
  const title = mainTab === 'challenges' ? '이번 주도 가볍게 도전해요' : '나를 위한 보상';

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
    <div className="relative flex min-h-[15rem] flex-col justify-end gap-5 overflow-hidden px-4 pt-10 pb-5 sm:min-h-[17rem] sm:px-10 sm:pt-14 lg:px-12">
      <div className="relative z-10">
        <p className="mb-3 text-sm font-semibold text-[#2e8c54] dark:text-primary md:text-base">
          {mainTab === 'tasks' ? selectedDateLabel : 'GrowDo'}
        </p>
        {mainTab === 'tasks' ? (
          <h1 className="friendly-heading max-w-3xl font-normal leading-[1.22] tracking-[-0.06em] sm:leading-[1.18]">
            <span className="flex min-w-0 items-center gap-1 whitespace-nowrap text-[clamp(1.05rem,5.25vw,1.7rem)] sm:inline md:text-[2.25rem] xl:text-[2.5rem]">
              <span className="shrink-0">{greeting.message},</span>
              <span className="min-w-0 truncate" title={`${username || '사용자'}님`}>
                {username || '사용자'}님.
              </span>
              <GreetingIcon
                aria-hidden="true"
                className={`size-[0.82em] shrink-0 stroke-[1.8] sm:inline-block sm:align-[-0.08em] ${greetingIconColor}`}
              />
            </span>
            <span className="mt-1 block whitespace-nowrap text-[clamp(1.05rem,5.25vw,1.7rem)] sm:mt-0 md:text-[2.25rem] xl:text-[2.5rem]">
              오늘 머물 곳을 정리해뒀어요.
            </span>
          </h1>
        ) : (
          <h1 className="friendly-heading max-w-3xl text-4xl font-normal leading-[1.18] tracking-[-0.06em] sm:text-6xl">
            {title}
          </h1>
        )}
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base md:text-lg md:leading-7">
          {description}
        </p>
      </div>
    </div>
  );
}
