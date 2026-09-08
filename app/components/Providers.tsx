'use client';

import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { primeAchievementSound } from '@/app/lib/achievementSound';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const primeAudio = () => primeAchievementSound();

    window.addEventListener('pointerdown', primeAudio, { capture: true, once: true });
    window.addEventListener('keydown', primeAudio, { capture: true, once: true });

    return () => {
      window.removeEventListener('pointerdown', primeAudio, { capture: true });
      window.removeEventListener('keydown', primeAudio, { capture: true });
    };
  }, []);

  return (
    <>
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        offset={{ top: 24 }}
        mobileOffset={{
          top: 16,
          right: 16,
          bottom: 'calc(5.75rem + env(safe-area-inset-bottom))',
          left: 16,
        }}
      />
    </>
  );
}
