'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refresh');

    if (!token || !refreshToken) {
      router.replace('/login');
      return;
    }

    const fetchUserAndStore = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!res.ok) throw new Error('Failed to fetch user');

        const json = await res.json();
        const data = json.data;

        setAuth(token, refreshToken, {
          id: data.id,
          username: data.nickname || data.name || data.email,
          name: data.name || '',
          email: data.email,
          role: data.role,
        });

        router.replace('/');
      } catch {
        router.replace('/login');
      }
    };

    fetchUserAndStore();
  }, [searchParams, router, setAuth]);

  return null;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">로그인 처리 중...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LoadingSpinner />
      <CallbackHandler />
    </Suspense>
  );
}
