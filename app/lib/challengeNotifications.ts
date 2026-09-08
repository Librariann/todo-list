import { createElement } from 'react';
import { toast } from 'sonner';
import ChallengeAchievementBanner from '@/app/components/feedback/ChallengeAchievementBanner';
import { playAchievementSound } from '@/app/lib/achievementSound';
import type { ChallengeAchievement } from '@/app/types/common';

const ACHIEVEMENT_DURATION = 5000;

export function getAwardedPoints(achievements: ChallengeAchievement[]): number {
  return achievements.reduce((total, achievement) => total + achievement.point, 0);
}

export function notifyChallengeAchievements(achievements: ChallengeAchievement[]): void {
  if (achievements.length === 0) return;

  const awardedPoints = getAwardedPoints(achievements);
  const position =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
      ? 'bottom-center'
      : 'top-center';

  playAchievementSound();

  toast.custom(
    (toastId) =>
      createElement(ChallengeAchievementBanner, {
        achievements,
        awardedPoints,
        duration: ACHIEVEMENT_DURATION,
        onDismiss: () => toast.dismiss(toastId),
      }),
    {
      duration: ACHIEVEMENT_DURATION,
      position,
      unstyled: true,
      className: 'challenge-achievement-toast',
    }
  );
}
