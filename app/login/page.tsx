'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import ThemeToggleStandalone from '../components/ThemeToggleStandalone';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const providers = [
  {
    key: 'google',
    label: 'Google로 시작하기',
    mark: 'G',
    className: 'bg-card text-foreground',
  },
  {
    key: 'kakao',
    label: '카카오로 시작하기',
    mark: 'K',
    className: 'bg-[#FEE500] text-[#251d00]',
  },
  {
    key: 'naver',
    label: '네이버로 시작하기',
    mark: 'N',
    className: 'bg-[#03C75A] text-white',
  },
] as const;

type OAuthProvider = (typeof providers)[number]['key'];

function toBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');

  return window
    .btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function createCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

async function createCodeChallenge(codeVerifier: string): Promise<string> {
  const digest = await window.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(codeVerifier)
  );

  return toBase64Url(new Uint8Array(digest));
}

export default function LoginPage() {
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    if (!API_URL) {
      setLoginError('로그인 서버 주소가 설정되지 않았습니다.');
      return;
    }

    setPendingProvider(provider);
    setLoginError(null);

    try {
      const codeVerifier = createCodeVerifier();
      const codeChallenge = await createCodeChallenge(codeVerifier);

      sessionStorage.setItem('oauth_code_verifier', codeVerifier);
      window.location.assign(
        `${API_URL}/api/auth/oauth/authorize/${provider}?code_challenge=${encodeURIComponent(codeChallenge)}`
      );
    } catch {
      sessionStorage.removeItem('oauth_code_verifier');
      setPendingProvider(null);
      setLoginError('로그인을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6 lg:flex lg:items-center lg:px-12">
      <div className="absolute right-4 top-4 z-10 sm:right-8 sm:top-8">
        <ThemeToggleStandalone />
      </div>

      <div className="daily-shell mx-auto grid w-full max-w-6xl overflow-hidden lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative flex min-h-[420px] flex-col justify-between overflow-hidden bg-[oklch(0.95_0.065_95)] p-8 text-foreground dark:bg-secondary/70 sm:p-12 lg:min-h-[680px] lg:p-16">
          <div>
            <div className="mb-16 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-primary text-primary-foreground">
                <span className="friendly-heading text-lg font-bold">G</span>
              </span>
              <span className="friendly-heading text-2xl font-bold">GrowDo</span>
            </div>
            <p className="mb-5 text-sm font-bold text-primary">매일 쓰는 나의 생산성 공간</p>
            <h1 className="friendly-heading max-w-xl break-keep text-4xl font-bold leading-[1.3] sm:text-5xl">
              오늘 할 일도,
              <br />
              부담 없이 하나씩.
            </h1>
            <p className="mt-7 max-w-md text-sm leading-7 opacity-80 sm:text-base">
              해야 할 일과 습관, 목표를 한곳에서 보고 나에게 맞는 속도로 이어가세요.
            </p>
          </div>

          <ul className="relative z-10 mt-16 grid gap-3 text-sm sm:grid-cols-3 lg:grid-cols-1">
            {['오늘 필요한 것만 한눈에', '완료할 때마다 기분 좋게', '꾸준함은 가볍게 확인'].map(
              (item) => (
                <li key={item} className="flex w-fit items-center rounded-full bg-card/80 px-4 py-2.5 font-medium shadow-sm">
                  {item}
                </li>
              )
            )}
          </ul>
        </section>

        <section className="flex flex-col justify-center p-7 sm:p-12 lg:p-16">
          <p className="journal-kicker mb-3">반가워요</p>
          <h2 className="friendly-heading text-3xl font-bold">오늘도 함께해볼까요?</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            사용하던 계정으로 간편하게 시작할 수 있어요.
          </p>

          <div className="mt-10 space-y-3">
            {providers.map((provider) => (
              <button
                key={provider.key}
                type="button"
                onClick={() => void handleOAuthLogin(provider.key)}
                disabled={pendingProvider !== null}
                className={`group flex min-h-14 w-full items-center gap-4 rounded-2xl border border-border px-5 text-left text-sm font-semibold transition-colors hover:border-primary/40 hover:bg-secondary/30 active:translate-y-px disabled:opacity-60 ${provider.className}`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-current/20 text-sm font-bold">
                  {provider.mark}
                </span>
                <span className="flex-1">
                  {pendingProvider === provider.key ? '로그인 페이지 여는 중...' : provider.label}
                </span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            ))}
          </div>

          {loginError && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {loginError}
            </p>
          )}

          <p className="mt-8 text-xs leading-5 text-muted-foreground">
            로그인하면 서비스 이용약관과 개인정보처리방침에 동의한 것으로 간주됩니다.
          </p>
        </section>
      </div>
    </main>
  );
}
