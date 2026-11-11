'use client';

import { Award, X } from 'lucide-react';
import type { ChallengeAchievement } from '@/app/types/common';

interface ChallengeAchievementBannerProps {
  achievements: ChallengeAchievement[];
  awardedPoints: number;
  duration: number;
  onDismiss: () => void;
}

export default function ChallengeAchievementBanner({
  achievements,
  awardedPoints,
  duration,
  onDismiss,
}: ChallengeAchievementBannerProps) {
  const visibleNames = achievements.slice(0, 2).map((achievement) => achievement.name);
  const hiddenCount = achievements.length - visibleNames.length;

  return (
    <section
      className="challenge-achievement-banner relative w-[min(calc(100vw-2rem),28rem)] overflow-hidden rounded-[var(--active-theme-overlay-radius,1.35rem)] border border-border bg-card text-card-foreground shadow-xl"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center gap-3.5 px-4 pb-4 pt-4 sm:px-5">
        <div className="challenge-achievement-mark relative grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
          <Award aria-hidden="true" className="size-6" strokeWidth={2.2} />
          <span aria-hidden="true" className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border-2 border-card bg-accent text-[11px] font-black text-accent-foreground">
            ✓
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold tracking-[0.08em] text-secondary-foreground">
            새로운 달성
          </p>
          <h2 className="friendly-heading mt-0.5 text-base font-extrabold sm:text-[17px]">
            {achievements.length === 1
              ? '도전과제를 해냈어요'
              : `${achievements.length}개를 한 번에 해냈어요`}
          </h2>
          <p className="mt-1 truncate text-sm font-medium text-muted-foreground">
            {visibleNames.join(' · ')}
            {hiddenCount > 0 ? ` 외 ${hiddenCount}개` : ''}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 self-start">
          <span className="rounded-full bg-accent px-2.5 py-1.5 text-sm font-black tabular-nums text-accent-foreground">
            +{awardedPoints.toLocaleString()} P
          </span>
          <button
            type="button"
            onClick={onDismiss}
            className="-mr-1 grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="달성 알림 닫기"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>

      <span
        aria-hidden="true"
        className="challenge-achievement-timer absolute inset-x-0 bottom-0 h-1 origin-left bg-primary"
        style={{ animationDuration: `${duration}ms` }}
      />
    </section>
  );
}
