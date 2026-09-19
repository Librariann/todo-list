'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/app/store/authStore';
import Header from '@/app/components/Header';
import ChallengesTab from './tabs/challenges-tab';
import ChallengeOperationsTab from './tabs/challenge-operations-tab';
import RewardsTab from './tabs/rewards-tab';
import UsersTab from './tabs/users-tab';
import NoticesTab from './tabs/notices-tab';

type AdminTab = 'challenges' | 'challengeOperations' | 'rewards' | 'users' | 'notices';

const tabs: { key: AdminTab; label: string }[] = [
  { key: 'challenges', label: '도전과제' },
  { key: 'challengeOperations', label: '순환 운영' },
  { key: 'rewards', label: '보상' },
  { key: 'users', label: '사용자' },
  { key: 'notices', label: '공지사항' },
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
      <Header mainTab="tasks" onTabChange={() => {}} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
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
            <p className="journal-kicker mb-2">GrowDo 운영</p>
            <h1 className="friendly-heading text-3xl font-bold tracking-tight text-foreground">
              관리 센터
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              도전과제, 보상, 사용자와 공지사항을 관리합니다
            </p>
          </div>
        </div>

        <div className="mb-8 flex max-w-full gap-6 overflow-x-auto border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`min-h-11 shrink-0 border-b-2 px-1 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'challenges' && <ChallengesTab />}
        {tab === 'challengeOperations' && <ChallengeOperationsTab />}
        {tab === 'rewards' && <RewardsTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'notices' && <NoticesTab />}
      </main>
    </div>
  );
}
