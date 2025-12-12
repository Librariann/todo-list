# Admin Page Implementation Patterns

## 1. ROUTING STRUCTURE

### Directory Layout

```
app/
├── page.tsx                 (Home - main dashboard)
├── login/
│   └── page.tsx            (Login page)
├── oauth/
│   └── callback/
│       └── page.tsx        (OAuth callback handler)
├── admin/                  (NEW - create this)
│   └── page.tsx            (Admin dashboard)
├── components/
├── store/
├── types/
├── lib/
├── hooks/
└── api/                    (Currently empty)
```

### Next.js 15 App Router Pattern

- **File-based routing**: `app/admin/page.tsx` → `/admin` route
- **Dynamic routes**: `app/admin/[id]/page.tsx` → `/admin/:id`
- **Nested layouts**: Create `app/admin/layout.tsx` for admin-specific layout

---

## 2. AUTH STORE & USER TYPE

### Location: `app/store/authStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  id: number;
  username: string;
  name: string;
  email: string;
  // ADD THIS FOR ADMIN:
  // role?: 'admin' | 'user';
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user, isAuthenticated: true }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAuth: () =>
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

**Key Points:**

- Uses Zustand for state management
- Persists to localStorage via `persist` middleware
- User type has: `id`, `username`, `name`, `email`
- **TODO**: Add `role` field if admin check needed

---

## 3. AUTH GUARD PATTERN

### From `app/page.tsx` (lines 44-51)

```typescript
'use client';

import { useAuthStore } from './store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Add auth check here if needed:
    // if (!isAuthenticated) {
    //   router.push('/login');
    // }
  }, []);

  // Only render after hydration to avoid SSR mismatch
  if (!mounted) return null;

  return (
    // Your component JSX
  );
}
```

**Key Pattern:**

1. Use `'use client'` directive (client component)
2. Extract `isAuthenticated` and `user` from `useAuthStore()`
3. Use `useRouter()` from `next/navigation` (NOT `next/router`)
4. Check `mounted` state before rendering (hydration safety)
5. Redirect to `/login` if not authenticated

---

## 4. API CALL PATTERN

### From `app/oauth/callback/page.tsx` (lines 21-44)

```typescript
const fetchUserAndStore = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Failed to fetch user');

    const json = await res.json();
    const data = json.data;

    setAuth(token, refreshToken, {
      id: data.id,
      username: data.nickname || data.name || data.email,
      name: data.name || '',
      email: data.email,
    });

    router.replace('/');
  } catch {
    router.replace('/login');
  }
};
```

**Key Pattern:**

1. Use `fetch()` with `${process.env.NEXT_PUBLIC_API_URL}` base URL
2. Pass token in `Authorization: Bearer ${token}` header
3. Response format: `{ data: { ... } }` (wrapped in `data` field)
4. Handle errors with try/catch
5. Use `router.replace()` for redirects (not `router.push()`)

### From `app/components/Header.tsx` (lines 37-49)

```typescript
const handleLogout = async () => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // Backend logout failure doesn't block frontend cleanup
  } finally {
    clearAuth();
    router.push('/login');
  }
};
```

**Key Pattern:**

- POST requests use `method: 'POST'`
- Always include `Authorization` header with token
- Use `finally` block to ensure cleanup happens

---

## 5. LOGIN PAGE STRUCTURE

### From `app/login/page.tsx`

```typescript
'use client';

import ThemeToggleStandalone from '../components/ThemeToggleStandalone';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="fixed top-4 right-4">
        <ThemeToggleStandalone />
      </div>

      <div className="w-full max-w-md">
        {/* Content */}
      </div>
    </div>
  );
}
```

**Key Pattern:**

- Full-screen centered layout
- Theme toggle in top-right
- OAuth buttons redirect to: `${API_URL}/oauth2/authorization/{provider}`
- Providers: Google, Kakao, Naver

---

## 6. OAUTH CALLBACK PATTERN

### From `app/oauth/callback/page.tsx`

```typescript
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
```

**Key Pattern:**

- Wrap in `<Suspense>` for `useSearchParams()`
- Extract `token` and `refresh` from query params
- Fetch user data with token
- Store auth state and redirect to home
- Show loading spinner during callback

---

## 7. COMPONENT STRUCTURE PATTERN

### From `app/components/Header.tsx`

```typescript
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

interface HeaderProps {
  mainTab: string;
  onTabChange: (tab: string) => void;
}

export default function Header({ mainTab, onTabChange }: HeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth, accessToken } = useAuthStore();

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch {
      // Ignore errors
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur">
      {/* Header content */}
    </header>
  );
}
```

**Key Pattern:**

- Define `Props` interface
- Use `'use client'` for interactive components
- Extract auth state at top of component
- Use `useRouter()` for navigation
- Use `useAuthStore()` for auth data

---

## 8. TAILWIND STYLING PATTERN

### Dark Mode & Responsive

```typescript
className =
  'min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4';

className =
  'sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-stone-200 dark:border-white/[0.07]';

className = 'text-gray-900 dark:text-white';
```

**Key Pattern:**

- Use `dark:` prefix for dark mode
- Use `/90` for opacity (e.g., `bg-white/90`)
- Use `sm:`, `md:`, `lg:` for responsive
- Use `backdrop-blur` for glass effect
- Use `gradient-to-*` for gradients

---

## 9. ENVIRONMENT VARIABLES

### `.env.local` (or `.env`)

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**Key Points:**

- `NEXT_PUBLIC_` prefix makes it available in browser
- Used in: `process.env.NEXT_PUBLIC_API_URL`
- Backend OAuth endpoints: `${API_URL}/oauth2/authorization/{provider}`
- User API: `${API_URL}/api/users/me`
- Logout API: `${API_URL}/api/auth/logout`

---

## 10. ADMIN PAGE TEMPLATE

### Create: `app/admin/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';

export default function AdminPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Auth guard: redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // TODO: Add role check if needed
    // if (user?.role !== 'admin') {
    //   router.push('/');
    // }
  }, [isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header mainTab="admin" onTabChange={() => {}} isMobileMenuOpen={false} onMobileMenuToggle={() => {}} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          관리자 대시보드
        </h1>

        {/* Admin content here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cards */}
        </div>
      </main>
    </div>
  );
}
```

---

## 11. QUICK CHECKLIST FOR ADMIN PAGE

- [ ] Create `app/admin/page.tsx`
- [ ] Add `'use client'` directive
- [ ] Import `useAuthStore`, `useRouter`, `useState`, `useEffect`
- [ ] Check `isAuthenticated` in `useEffect`
- [ ] Redirect to `/login` if not authenticated
- [ ] Add role check if needed (requires User type update)
- [ ] Use `mounted` state for hydration safety
- [ ] Import and use `Header` component
- [ ] Use Tailwind classes with `dark:` prefix
- [ ] Use `${process.env.NEXT_PUBLIC_API_URL}` for API calls
- [ ] Include `Authorization: Bearer ${accessToken}` in fetch headers

---

## 12. IMPORT ALIASES

All imports use `@/` prefix:

```typescript
import { useAuthStore } from '@/app/store/authStore';
import Header from '@/app/components/Header';
import { Todo } from '@/app/types/todo';
```

This is configured in `tsconfig.json` or `next.config.js`.

---

## 13. TYPES REFERENCE

### From `app/types/todo.ts`

```typescript
export enum TaskType {
  HABIT = 'habit',
  DAILY = 'daily',
  TODO = 'todo',
}

export enum TodoStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum RewardType {
  COFFEE_COUPON = 'coffee_coupon',
  GIFT_CARD = 'gift_card',
  DISCOUNT = 'discount',
  POINTS = 'points',
  CUSTOM = 'custom',
}

export interface Reward {
  id: string;
  type: RewardType;
  name: string;
  description: string;
  iconUrl?: string;
  value: number;
}

export interface UserStats {
  rewardPoints: number;
  totalPoints: number;
  // ... other fields
}
```

---

## Summary

**For Admin Page, replicate:**

1. ✅ `'use client'` directive
2. ✅ Auth guard with `useAuthStore()` + `useRouter()`
3. ✅ Hydration safety with `mounted` state
4. ✅ API calls with `Authorization` header
5. ✅ Tailwind styling with `dark:` prefix
6. ✅ Component structure with Props interface
7. ✅ Use `@/` import aliases
8. ✅ Environment variable: `process.env.NEXT_PUBLIC_API_URL`
