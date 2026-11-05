'use client';

import { useEffect, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/app/store/authStore';
import { postNativeAuthEvent } from '@/app/lib/nativeBridge';

const HomeWorkspace = dynamic(() => import('@/app/HomeWorkspace'), {
  loading: () => (
    <div
      className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted-foreground"
      role="status"
    >
      오늘의 할 일을 준비하고 있어요.
    </div>
  ),
});

export default function HomeEntry({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState<boolean>(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !isAuthenticated) postNativeAuthEvent('AUTH_EXPIRED');
  }, [mounted, isAuthenticated]);

  if (mounted && isAuthenticated) return <HomeWorkspace />;
  return children;
}
