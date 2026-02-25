'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/app/store/authStore';
import { apiFetch } from '@/app/lib/apiClient';
import Header from '@/app/components/Header';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Types ────────────────────────────────────────────────────────────────────

type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
type WorkType = 'HABITS' | 'TODOS' | 'GOALS';
type RewardType = 'COUPON' | 'POINT';
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
type UserRole = 'USER' | 'ADMIN';
type AdminTab = 'challenges' | 'rewards' | 'users';

interface Challenge {
  id: number;
  name: string;
  description: string;
  icon: string;
  recurrenceType: RecurrenceType;
  targetCount: number;
  point: number;
  isActive: boolean;
}

interface ChallengeForm {
  name: string;
  description: string;
  icon: string;
  recurrenceType: RecurrenceType;
  targetCount: number;
  dailyMaxCount: number;
  workType: WorkType;
  point: number;
  active: boolean;
}

const defaultChallengeForm: ChallengeForm = {
  name: '',
  description: '',
  icon: '🏆',
  recurrenceType: 'DAILY',
  targetCount: 1,
  dailyMaxCount: 1,
  workType: 'HABITS',
  point: 10,
  active: true,
};

interface Reward {
  id: number;
  name: string;
  type: RewardType;
  point: number;
  description: string;
  discount: boolean;
  discountRate: number;
  isActive: boolean;
}

interface RewardForm {
  name: string;
  type: RewardType;
  point: number;
  description: string;
  discount: boolean;
  discountRate: number;
  isActive: boolean;
}

const defaultRewardForm: RewardForm = {
  name: '',
  type: 'POINT',
  point: 100,
  description: '',
  discount: false,
  discountRate: 0,
  isActive: true,
};

interface AdminUser {
  id: number;
  nickname: string;
  email: string;
  name: string;
  phoneNumber: string;
  status: UserStatus;
  role: UserRole;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

const inputCls =
  'w-full px-3 py-2 rounded-lg text-sm bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/[0.1] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors';

function Field({
  label,
  children,
  span2,
}: {
  label: string;
  children: React.ReactNode;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}

function ActionBtn({
  danger,
  onClick,
  disabled,
  children,
}: {
  danger?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors disabled:opacity-40 ${
        danger
          ? 'border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'
          : 'border-stone-200 dark:border-white/[0.1] text-muted-foreground hover:bg-stone-50 dark:hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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

  const tabs: { key: AdminTab; label: string }[] = [
    { key: 'challenges', label: '🏆 도전과제' },
    { key: 'rewards', label: '🎁 보상' },
    { key: 'users', label: '👥 사용자' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        mainTab="tasks"
        onTabChange={() => {}}
        isMobileMenuOpen={false}
        onMobileMenuToggle={() => {}}
      />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
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

        {/* Tab nav */}
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

// ─── Challenges Tab ───────────────────────────────────────────────────────────

function ChallengesTab() {
  const [list, setList] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ChallengeForm>(defaultChallengeForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_URL}/api/challenges/`);
      if (res.ok) {
        const d = await res.json();
        setList(d.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  function openCreate() {
    setEditId(null);
    setForm(defaultChallengeForm);
    setShowForm(true);
  }

  function openEdit(c: Challenge) {
    setEditId(c.id);
    setForm({
      name: c.name,
      description: c.description,
      icon: c.icon || '🏆',
      recurrenceType: c.recurrenceType,
      targetCount: c.targetCount,
      dailyMaxCount: c.targetCount,
      workType: 'HABITS',
      point: c.point,
      active: c.isActive,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editId !== null) {
        await apiFetch(`${API_URL}/api/challenges/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            icon: form.icon,
            recurrenceType: form.recurrenceType,
            targetCount: form.targetCount,
            point: form.point,
          }),
        });
      } else {
        await apiFetch(`${API_URL}/api/challenges/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      setShowForm(false);
      await fetchList();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('이 도전과제를 삭제하시겠습니까?')) return;
    setDeletingId(id);
    try {
      await apiFetch(`${API_URL}/api/challenges/${id}`, { method: 'DELETE' });
      await fetchList();
    } finally {
      setDeletingId(null);
    }
  }

  const recurrenceKo = (r: RecurrenceType) =>
    r === 'DAILY' ? '일일' : r === 'WEEKLY' ? '주간' : '월간';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{list.length}개의 도전과제</p>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + 새 도전과제
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-card rounded-xl border border-stone-200 dark:border-white/[0.07] p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4 text-sm">
            {editId ? '도전과제 수정' : '새 도전과제 등록'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="이름 *">
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="도전과제 이름"
              />
            </Field>
            <Field label="아이콘">
              <input
                className={inputCls}
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="🏆"
              />
            </Field>
            <Field label="설명" span2>
              <input
                className={inputCls}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="도전과제 설명"
              />
            </Field>
            <Field label="반복 주기 *">
              <select
                className={inputCls}
                value={form.recurrenceType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, recurrenceType: e.target.value as RecurrenceType }))
                }
              >
                <option value="DAILY">일일</option>
                <option value="WEEKLY">주간</option>
                <option value="MONTHLY">월간</option>
              </select>
            </Field>
            <Field label="작업 유형 *">
              <select
                className={inputCls}
                value={form.workType}
                onChange={(e) => setForm((f) => ({ ...f, workType: e.target.value as WorkType }))}
                disabled={!!editId}
              >
                <option value="HABITS">습관</option>
                <option value="TODOS">할일</option>
                <option value="GOALS">목표</option>
              </select>
            </Field>
            <Field label="목표 횟수">
              <input
                className={inputCls}
                type="number"
                min={1}
                value={form.targetCount}
                onChange={(e) => setForm((f) => ({ ...f, targetCount: +e.target.value }))}
              />
            </Field>
            {!editId && (
              <Field label="일일 최대 횟수 *">
                <input
                  className={inputCls}
                  type="number"
                  min={1}
                  value={form.dailyMaxCount}
                  onChange={(e) => setForm((f) => ({ ...f, dailyMaxCount: +e.target.value }))}
                />
              </Field>
            )}
            <Field label="보상 포인트 *">
              <input
                className={inputCls}
                type="number"
                min={0}
                value={form.point}
                onChange={(e) => setForm((f) => ({ ...f, point: +e.target.value }))}
              />
            </Field>
            <Field label="활성화">
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="w-4 h-4 accent-primary rounded"
                />
                <span className="text-sm text-muted-foreground">활성 상태로 등록</span>
              </label>
            </Field>
          </div>
          <div className="flex gap-2 mt-5 pt-4 border-t border-stone-100 dark:border-white/[0.05]">
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-stone-200 dark:border-white/[0.1] text-sm font-medium text-muted-foreground hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-stone-100 dark:bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          등록된 도전과제가 없습니다
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 bg-white dark:bg-card border border-stone-200 dark:border-white/[0.07] rounded-xl px-4 py-3 hover:shadow-sm transition-shadow"
            >
              <span className="text-xl shrink-0 w-8 text-center">{c.icon || '🏆'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground text-sm">{c.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${c.isActive ? 'bg-primary/10 text-primary' : 'bg-stone-100 dark:bg-white/5 text-muted-foreground'}`}
                  >
                    {c.isActive ? '활성' : '비활성'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {recurrenceKo(c.recurrenceType)}
                  </span>
                  <span className="text-xs text-muted-foreground">목표 {c.targetCount}회</span>
                  <span className="text-xs font-semibold text-primary">
                    {c.point.toLocaleString()}pt
                  </span>
                  {c.description && (
                    <span className="text-xs text-muted-foreground truncate hidden sm:block">
                      {c.description}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <ActionBtn onClick={() => openEdit(c)}>수정</ActionBtn>
                <ActionBtn danger onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}>
                  {deletingId === c.id ? '...' : '삭제'}
                </ActionBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Rewards Tab ──────────────────────────────────────────────────────────────

function RewardsTab() {
  const [list, setList] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<RewardForm>(defaultRewardForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_URL}/api/rewards/`);
      if (res.ok) {
        const d = await res.json();
        setList(d.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  function openCreate() {
    setEditId(null);
    setForm(defaultRewardForm);
    setShowForm(true);
  }

  function openEdit(r: Reward) {
    setEditId(r.id);
    setForm({
      name: r.name,
      type: r.type,
      point: r.point,
      description: r.description,
      discount: r.discount,
      discountRate: r.discountRate,
      isActive: r.isActive,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editId !== null) {
        await apiFetch(`${API_URL}/api/rewards/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            type: form.type,
            point: form.point,
            description: form.description,
            discount: form.discount,
            discountRate: form.discountRate,
          }),
        });
      } else {
        await apiFetch(`${API_URL}/api/rewards/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      setShowForm(false);
      await fetchList();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('이 보상을 삭제하시겠습니까?')) return;
    setDeletingId(id);
    try {
      await apiFetch(`${API_URL}/api/rewards/${id}`, { method: 'DELETE' });
      await fetchList();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{list.length}개의 보상</p>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + 새 보상
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-card rounded-xl border border-stone-200 dark:border-white/[0.07] p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4 text-sm">
            {editId ? '보상 수정' : '새 보상 등록'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="이름 *">
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="보상 이름"
              />
            </Field>
            <Field label="유형 *">
              <select
                className={inputCls}
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as RewardType }))}
              >
                <option value="POINT">포인트</option>
                <option value="COUPON">쿠폰</option>
              </select>
            </Field>
            <Field label="포인트 *">
              <input
                className={inputCls}
                type="number"
                min={0}
                value={form.point}
                onChange={(e) => setForm((f) => ({ ...f, point: +e.target.value }))}
              />
            </Field>
            <Field label="설명">
              <input
                className={inputCls}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="보상 설명"
              />
            </Field>
            <Field label="할인 적용">
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.discount}
                  onChange={(e) => setForm((f) => ({ ...f, discount: e.target.checked }))}
                  className="w-4 h-4 accent-primary rounded"
                />
                <span className="text-sm text-muted-foreground">할인 적용</span>
              </label>
            </Field>
            {form.discount && (
              <Field label="할인율 (%)">
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  max={100}
                  value={form.discountRate}
                  onChange={(e) => setForm((f) => ({ ...f, discountRate: +e.target.value }))}
                />
              </Field>
            )}
            <Field label="활성화">
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-primary rounded"
                />
                <span className="text-sm text-muted-foreground">활성 상태로 등록</span>
              </label>
            </Field>
          </div>
          <div className="flex gap-2 mt-5 pt-4 border-t border-stone-100 dark:border-white/[0.05]">
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-stone-200 dark:border-white/[0.1] text-sm font-medium text-muted-foreground hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-stone-100 dark:bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          등록된 보상이 없습니다
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 bg-white dark:bg-card border border-stone-200 dark:border-white/[0.07] rounded-xl px-4 py-3 hover:shadow-sm transition-shadow"
            >
              <span className="text-xl shrink-0 w-8 text-center">🎁</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground text-sm">{r.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-white/5 text-muted-foreground font-semibold">
                    {r.type === 'COUPON' ? '쿠폰' : '포인트'}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${r.isActive ? 'bg-primary/10 text-primary' : 'bg-stone-100 dark:bg-white/5 text-muted-foreground'}`}
                  >
                    {r.isActive ? '활성' : '비활성'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs font-semibold text-primary">
                    {r.point.toLocaleString()}pt
                  </span>
                  {r.discount && (
                    <span className="text-xs text-muted-foreground">할인 {r.discountRate}%</span>
                  )}
                  {r.description && (
                    <span className="text-xs text-muted-foreground truncate hidden sm:block">
                      {r.description}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <ActionBtn onClick={() => openEdit(r)}>수정</ActionBtn>
                <ActionBtn danger onClick={() => handleDelete(r.id)} disabled={deletingId === r.id}>
                  {deletingId === r.id ? '...' : '삭제'}
                </ActionBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [list, setList] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`${API_URL}/api/users/active`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setList(d.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const statusLabel = (s: UserStatus) =>
    s === 'ACTIVE' ? '활성' : s === 'INACTIVE' ? '비활성' : '정지';

  const statusCls = (s: UserStatus) =>
    s === 'ACTIVE'
      ? 'bg-emerald-50 dark:bg-emerald-900/15 text-emerald-600 dark:text-emerald-400'
      : s === 'SUSPENDED'
        ? 'bg-red-50 dark:bg-red-900/15 text-red-500'
        : 'bg-stone-100 dark:bg-white/5 text-muted-foreground';

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{list.length}명의 사용자</p>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-stone-100 dark:bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          사용자 데이터가 없습니다
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 bg-white dark:bg-card border border-stone-200 dark:border-white/[0.07] rounded-xl px-4 py-3 hover:shadow-sm transition-shadow"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {(u.nickname || u.name || '?')[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground text-sm">
                    {u.nickname || u.name}
                  </span>
                  {u.role === 'ADMIN' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">
                      ADMIN
                    </span>
                  )}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${statusCls(u.status)}`}
                  >
                    {statusLabel(u.status)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{u.email}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-muted-foreground">{fmtDate(u.createdAt)}</span>
                <div className="text-[10px] text-muted-foreground mt-0.5">#{u.id}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
