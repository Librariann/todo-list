'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggleStandalone from '@/app/components/ThemeToggleStandalone';
import { useAuthStore } from '@/app/store/authStore';
import {
  fetchMyProfile,
  updateMyProfile,
  type UpdateUserProfileInput,
  type UserProfile,
} from '@/app/lib/usersApi';
import ProfileForm from './ProfileForm';

const joinedDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, setUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const loadProfile = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        setProfile(await fetchMyProfile());
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : '내 정보를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, [isAuthenticated, mounted, router]);

  const handleUpdate = async (input: UpdateUserProfileInput) => {
    const updatedProfile = await updateMyProfile(input);
    setProfile(updatedProfile);
    setUser({
      id: updatedProfile.id,
      username: updatedProfile.nickname,
      name: updatedProfile.name ?? '',
      email: updatedProfile.email,
      role: updatedProfile.role,
    });
    toast.success('내 정보를 저장했어요.');
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#d9e1d5] dark:bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">내 자리를 준비하고 있어요...</p>
        </div>
      </div>
    );
  }

  if (!profile || loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#d9e1d5] px-5 dark:bg-background">
        <div className="max-w-md text-center">
          <h1 className="friendly-heading text-3xl font-bold">정보를 불러오지 못했어요</h1>
          <p className="mt-3 text-sm text-muted-foreground">{loadError}</p>
          <Link href="/" className="mt-6 inline-flex min-h-11 items-center text-sm font-bold text-primary">
            오늘 화면으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#d9e1d5] px-3 py-3 dark:bg-background sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-card shadow-[0_24px_70px_rgba(38,48,42,0.12)]">
        <header className="flex min-h-20 items-center justify-between border-b border-border px-5 sm:px-8">
          <Link href="/" className="friendly-heading text-2xl font-bold tracking-[-0.06em]">
            GrowDo
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">오늘로 돌아가기</span>
            </Link>
            <ThemeToggleStandalone />
          </div>
        </header>

        <main className="grid lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)]">
          <aside className="relative overflow-hidden bg-[#28342d] px-7 py-10 text-[#f7f3e9] sm:px-10 sm:py-14 lg:min-h-[680px] lg:px-12">
            <div className="relative z-10 flex h-full flex-col justify-between gap-14">
              <div>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e4eddf] friendly-heading text-3xl font-bold text-[#216c40]">
                  {profile.nickname.slice(0, 1).toUpperCase()}
                </div>
                <p className="mt-8 text-xs font-bold tracking-[0.18em] text-[#a9c7b3]">MY PLACE</p>
                <h2 className="friendly-heading mt-3 text-4xl font-bold leading-tight tracking-[-0.055em]">
                  {profile.nickname}님의
                  <br />
                  작은 자리
                </h2>
                <p className="mt-5 max-w-sm text-sm leading-6 text-[#c9d5cd]">
                  편안하게 불릴 이름을 정하고, 내 일상을 위한 기본 정보를 관리해요.
                </p>
              </div>

              <dl className="space-y-4 border-t border-white/15 pt-6 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#a9b8ae]">계정 유형</dt>
                  <dd className="font-semibold">{profile.role === 'ADMIN' ? '관리자' : '일반 사용자'}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#a9b8ae]">함께한 날</dt>
                  <dd className="font-semibold">
                    {joinedDateFormatter.format(new Date(profile.createdAt))}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>

          <section className="bg-[#fbf8ef] px-6 py-10 dark:bg-card sm:px-10 sm:py-14 lg:px-14">
            <ProfileForm profile={profile} onSubmit={handleUpdate} />
          </section>
        </main>
      </div>
    </div>
  );
}
