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
      className="challenge-achievement-banner relative w-[min(calc(100vw-2rem),28rem)] overflow-hidden border border-emerald-200/80 bg-[#f7f8ef] text-[#173522] shadow-[0_18px_55px_rgba(31,82,51,0.2)] dark:border-emerald-800 dark:bg-[#15251b] dark:text-[#edf7ee]"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center gap-3.5 px-4 pb-4 pt-4 sm:px-5">
        <div className="challenge-achievement-mark relative grid size-12 shrink-0 place-items-center rounded-full bg-[#2f9b58] text-white shadow-[inset_0_-3px_0_rgba(18,87,46,0.22)]">
          <Award aria-hidden="true" className="size-6" strokeWidth={2.2} />
          <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border-2 border-[#f7f8ef] bg-[#ffd45c] text-[11px] font-black text-[#654700] dark:border-[#15251b]">
            ✓
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold tracking-[0.08em] text-[#2b824d] dark:text-emerald-300">
            새로운 달성
          </p>
          <h2 className="friendly-heading mt-0.5 text-base font-extrabold sm:text-[17px]">
            {achievements.length === 1
              ? '도전과제를 해냈어요'
              : `${achievements.length}개를 한 번에 해냈어요`}
          </h2>
          <p className="mt-1 truncate text-sm font-medium text-[#53685a] dark:text-[#b7cbbd]">
            {visibleNames.join(' · ')}
            {hiddenCount > 0 ? ` 외 ${hiddenCount}개` : ''}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 self-start">
          <span className="rounded-full bg-[#ffe49a] px-2.5 py-1.5 text-sm font-black tabular-nums text-[#705000] dark:bg-amber-300 dark:text-amber-950">
            +{awardedPoints.toLocaleString()} P
          </span>
          <button
            type="button"
            onClick={onDismiss}
            className="-mr-1 grid size-11 place-items-center rounded-full text-[#637368] transition-colors hover:bg-black/5 hover:text-[#173522] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f9b58] dark:text-[#a7b9ab] dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="달성 알림 닫기"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>

      <span
        aria-hidden="true"
        className="challenge-achievement-timer absolute inset-x-0 bottom-0 h-1 origin-left bg-[#2f9b58]"
        style={{ animationDuration: `${duration}ms` }}
      />
    </section>
  );
}
