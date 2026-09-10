'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from 'sonner';
import { primeAchievementSound } from '@/app/lib/achievementSound';
import {
  postNativeBridgeReady,
  queueNativeNotification,
  subscribeToNativeNotificationMessages,
} from '@/app/lib/nativeBridge';

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const primeAudio = () => primeAchievementSound();

    window.addEventListener('pointerdown', primeAudio, { capture: true, once: true });
    window.addEventListener('keydown', primeAudio, { capture: true, once: true });

    return () => {
      window.removeEventListener('pointerdown', primeAudio, { capture: true });
      window.removeEventListener('keydown', primeAudio, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (pathname === '/login' || pathname === '/oauth/callback') return;

    const unsubscribe = subscribeToNativeNotificationMessages((destination) => {
      queueNativeNotification(destination);
      if (pathname !== '/') router.push('/');
    });
    postNativeBridgeReady();
    return unsubscribe;
  }, [pathname, router]);

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
