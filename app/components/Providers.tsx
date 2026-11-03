'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from 'sonner';
import { primeAchievementSound } from '@/app/lib/achievementSound';
import {
  postNativeBridgeReady,
  postNativeNavigationState,
  queueNativeNotification,
  subscribeToNativeNavigationMessages,
  subscribeToNativeNotificationMessages,
  type NativeNavigationDestination,
} from '@/app/lib/nativeBridge';
import { useAuthStore } from '@/app/store/authStore';
import NativeWidgetSync from '@/app/components/NativeWidgetSync';

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((auth) => auth.isAuthenticated);
  const nativeNavigationReadyRef = useRef<boolean>(false);

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
    const destination: NativeNavigationDestination =
      pathname === '/profile' ? 'profile' : pathname === '/coupons' ? 'coupons' : 'home';
    const canNavigate = isAuthenticated && pathname !== '/login' && pathname !== '/oauth/callback';
    const reportNavigationState = () => {
      if (canNavigate && nativeNavigationReadyRef.current) {
        postNativeNavigationState(destination);
      }
    };

    const unsubscribe = subscribeToNativeNavigationMessages((message) => {
      if (message.type === 'NATIVE_NAVIGATION_READY') {
        nativeNavigationReadyRef.current = true;
        reportNavigationState();
        return;
      }
      if (!canNavigate || !nativeNavigationReadyRef.current) return;

      const targetPath = message.destination === 'home' ? '/' : message.destination === 'profile' ? '/profile' : '/coupons';
      if (message.destination === 'home' && pathname === '/') {
        window.dispatchEvent(new Event('growdo:native-home'));
      }
      if (pathname !== targetPath) router.push(targetPath);
      else reportNavigationState();
    });

    const themeObserver = new MutationObserver(reportNavigationState);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    reportNavigationState();
    return () => {
      unsubscribe();
      themeObserver.disconnect();
    };
  }, [isAuthenticated, pathname, router]);

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
      <NativeWidgetSync />
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
