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
    <div className="relative flex min-h-[17rem] flex-col justify-end gap-5 overflow-hidden px-5 pt-10 pb-5 sm:px-10 sm:pt-14 lg:px-12">
      <div className="relative z-10">
        <p className="mb-3 text-sm font-semibold text-[#2e8c54] dark:text-primary">
          {mainTab === 'tasks' ? selectedDateLabel : 'GrowDo'}
        </p>
        {mainTab === 'tasks' ? (
          <h1 className="friendly-heading max-w-3xl text-4xl font-normal leading-[1.18] tracking-[-0.06em] sm:text-6xl">
            <span>
              {greeting.message}, {username || '사용자'}님.{' '}
              <GreetingIcon
                aria-hidden="true"
                className={`inline-block size-[0.82em] align-[-0.08em] stroke-[1.8] ${greetingIconColor}`}
              />
            </span>
            <span className="block">오늘 머물 곳을 정리해뒀어요.</span>
          </h1>
        ) : (
          <h1 className="friendly-heading max-w-3xl text-4xl font-normal leading-[1.18] tracking-[-0.06em] sm:text-6xl">
            {title}
          </h1>
        )}
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}
