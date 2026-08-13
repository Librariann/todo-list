# Growdo OAuth 설정 가이드

Growdo는 Authorization Code + PKCE 방식으로 소셜 로그인을 처리합니다. 브라우저 URL에는 JWT가 노출되지 않으며, 백엔드가 발급한 60초짜리 일회용 코드만 전달됩니다.

## 로그인 흐름

1. 프론트가 PKCE `code_verifier`와 `code_challenge`를 생성합니다.
2. `/api/auth/oauth/authorize/{provider}?code_challenge=...`로 로그인합니다.
3. 소셜 공급자는 백엔드 콜백으로 Authorization Code를 전달합니다.
4. 백엔드는 공급자 코드를 교환하고 Growdo 일회용 코드를 발급합니다.
5. 프론트는 `/oauth/callback?code=...`에서 코드를 받습니다.
6. `POST /api/auth/oauth/exchange`에 코드와 verifier를 보내 Access Token으로 교환합니다.
7. Refresh Token은 `HttpOnly` 쿠키로만 저장됩니다.

## 공급자 콜백 URL

각 OAuth 공급자 콘솔에는 프론트 주소가 아니라 백엔드 콜백을 등록합니다.

- Google: `http://localhost:8080/login/oauth2/code/google`
- Kakao: `http://localhost:8080/login/oauth2/code/kakao`
- Naver: `http://localhost:8080/login/oauth2/code/naver`

프로덕션에서는 `http://localhost:8080`을 실제 HTTPS 백엔드 주소로 교체합니다.

## 환경변수

프론트 `.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8080
```

백엔드:

```dotenv
OAUTH2_REDIRECT_URI=http://localhost:3000/oauth/callback
COOKIE_SECURE=false
COOKIE_SAME_SITE=Lax
```

프로덕션에서는 반드시 `COOKIE_SECURE=true`를 사용합니다. 프론트와 백엔드가 서로 다른 사이트에 있다면 HTTPS와 함께 `COOKIE_SAME_SITE=None`이 필요할 수 있습니다.

OAuth Client ID와 Client Secret은 백엔드 환경변수 또는 비밀 저장소에만 설정하고 프론트 환경변수에 넣지 않습니다.

## 확인 사항

- 콜백 URL에 `token` 또는 `refresh`가 나타나지 않아야 합니다.
- `/oauth/callback`에는 짧게 `code`만 나타나고 프론트가 즉시 URL에서 제거해야 합니다.
- `/api/auth/oauth/exchange` 응답에는 Access Token만 포함되어야 합니다.
- Refresh Token 쿠키에는 `HttpOnly`, 프로덕션에서는 `Secure`가 설정되어야 합니다.
- 같은 일회용 코드를 두 번 교환하면 두 번째 요청은 401이어야 합니다.
