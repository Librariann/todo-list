const LOGIN_PROVIDERS = ['google', 'kakao', 'naver', 'apple'] as const;
const LAST_LOGIN_PROVIDER_KEY = 'growdo.lastLoginProvider';
export const PENDING_LOGIN_PROVIDER_KEY = 'growdo.pendingLoginProvider';

export type OAuthProvider = (typeof LOGIN_PROVIDERS)[number];

function isOAuthProvider(value: unknown): value is OAuthProvider {
  return LOGIN_PROVIDERS.some((provider) => provider === value);
}

export function getLastLoginProvider(): OAuthProvider | null {
  try {
    const provider = window.localStorage.getItem(LAST_LOGIN_PROVIDER_KEY);
    return isOAuthProvider(provider) ? provider : null;
  } catch {
    return null;
  }
}

export function rememberLoginProvider(provider: unknown): void {
  if (!isOAuthProvider(provider)) return;
  try {
    window.localStorage.setItem(LAST_LOGIN_PROVIDER_KEY, provider);
  } catch {
    // 로그인 방법을 기억하지 못해도 로그인을 계속 진행한다.
  }
}
