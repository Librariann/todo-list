'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const codeVerifier = sessionStorage.getItem('oauth_code_verifier');

    window.history.replaceState({}, document.title, '/oauth/callback');

    if (error || !code || !codeVerifier) {
      sessionStorage.removeItem('oauth_code_verifier');
      router.replace('/login');
      return;
    }

    const exchangeCodeAndStore = async () => {
      try {
        const exchangeRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth/exchange`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, codeVerifier }),
          }
        );
        if (!exchangeRes.ok) throw new Error('Failed to exchange OAuth code');

        const exchangeJson = await exchangeRes.json();
        const token = exchangeJson.data?.accessToken;
        if (!token) throw new Error('Missing access token');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch user');

        const json = await res.json();
        const data = json.data;

        setAuth(token, null, {
          id: data.id,
          username: data.nickname || data.name || data.email,
          name: data.name || '',
          email: data.email,
          role: data.role,
        });

        router.replace('/');
      } catch {
        router.replace('/login');
      } finally {
        sessionStorage.removeItem('oauth_code_verifier');
      }
    };

    void exchangeCodeAndStore();
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
