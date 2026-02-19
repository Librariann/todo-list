'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/app/store/authStore';
import Header from '@/app/components/Header';
import ChallengesTab from './tabs/challenges-tab';
import RewardsTab from './tabs/rewards-tab';
import UsersTab from './tabs/users-tab';

type AdminTab = 'challenges' | 'rewards' | 'users';

const tabs: { key: AdminTab; label: string }[] = [
  { key: 'challenges', label: '🏆 도전과제' },
  { key: 'rewards', label: '🎁 보상' },
  { key: 'users', label: '👥 사용자' },
];

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<AdminTab>('challenges');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.replace('/');
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-background">
      <Header
        mainTab="tasks"
        onTabChange={() => {}}
        isMobileMenuOpen={false}
        onMobileMenuToggle={() => {}}
      />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← 메인으로
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">관리자 페이지</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              도전과제, 보상, 사용자를 관리합니다
            </p>
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-xl bg-stone-100 dark:bg-card w-fit mb-6 border border-stone-200 dark:border-white/[0.07]">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-white dark:bg-stone-700 shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'challenges' && <ChallengesTab />}
        {tab === 'rewards' && <RewardsTab />}
        {tab === 'users' && <UsersTab />}
      </main>
    </div>
  );
}
