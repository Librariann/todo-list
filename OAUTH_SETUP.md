# OAuth 전용 로그인 설정 가이드

Todo Master 앱은 100% OAuth 기반 인증 시스템을 사용합니다. 별도의 회원가입 없이 소셜 계정으로만 로그인할 수 있습니다.

## 1. Google OAuth 설정

### Google Cloud Console에서 설정
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "APIs & Services" → "Credentials"로 이동
4. "+ CREATE CREDENTIALS" → "OAuth 2.0 Client IDs" 선택
5. Application type: "Web application"
6. Authorized redirect URIs에 추가:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (배포 시)

### 환경 변수 설정
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 2. Kakao OAuth 설정

### Kakao Developers에서 설정
1. [Kakao Developers](https://developers.kakao.com/)에 접속하여 로그인
2. "내 애플리케이션" → "애플리케이션 추가하기"
3. 앱 이름, 사업자명 입력 후 생성
4. "플랫폼" → "Web 플랫폼 등록"
5. 사이트 도메인 등록: `http://localhost:3000`
6. "카카오 로그인" 활성화
7. Redirect URI 설정:
   - `http://localhost:3000/api/auth/callback/kakao`
   - `https://yourdomain.com/api/auth/callback/kakao` (배포 시)
8. 동의항목에서 필요한 정보 설정 (닉네임, 이메일)

### 환경 변수 설정
```bash
KAKAO_CLIENT_ID=your-kakao-rest-api-key
KAKAO_CLIENT_SECRET=your-kakao-client-secret
```

## 3. Naver OAuth 설정

### 네이버 개발자센터에서 설정
1. [네이버 개발자센터](https://developers.naver.com/)에 접속
2. "Application" → "애플리케이션 등록"
3. 애플리케이션 이름 입력
4. 사용 API: "네아로(네이버 아이디로 로그인)" 선택
5. 제공 정보: 이메일주소, 이름, 프로필 사진 선택
6. 서비스 환경:
   - PC 웹: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/api/auth/callback/naver`

### 환경 변수 설정
```bash
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
```

## 4. NextAuth 설정

### 필수 환경 변수
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here
```

### NEXTAUTH_SECRET 생성 방법
```bash
openssl rand -base64 32
```

## 5. 전체 .env.local 예시

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Kakao OAuth
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

# Naver OAuth
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
```

## 6. 테스트 방법

1. 환경 변수를 올바르게 설정했는지 확인
2. `npm run dev`로 개발 서버 시작
3. `http://localhost:3000/login`에서 소셜 로그인 테스트
4. 각 소셜 플랫폼의 로그인 버튼 클릭하여 인증 플로우 확인

## 주의사항

- 각 플랫폼의 개발자 정책을 확인하여 적절한 앱 설정을 해주세요
- 프로덕션 배포 시 도메인을 변경하고 각 플랫폼에서 콜백 URL을 업데이트해주세요
- 환경 변수 파일(.env.local)은 Git에 커밋하지 마세요