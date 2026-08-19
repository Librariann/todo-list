'use client';

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/app/lib/apiClient';
import { AdminUser, UserStatus } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

interface GrantTarget {
  userId: number;
  nickname: string;
}

function GrantModal({ target, onClose }: { target: GrantTarget; onClose: () => void }) {
  const [amount, setAmount] = useState<number>(0);
  const [granting, setGranting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleGrant() {
    if (amount <= 0) return;
    setGranting(true);
    try {
      await apiFetch(`${API_URL}/api/user/points/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: +target.userId, point: amount }),
      });
      onClose();
    } finally {
      setGranting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-card w-full max-w-sm mx-4 rounded-2xl shadow-xl border border-stone-200 dark:border-white/[0.07] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-foreground text-base">포인트 지급</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-3 bg-stone-50 dark:bg-white/[0.03] rounded-xl px-4 py-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-primary">
              {target.nickname[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{target.nickname}</p>
            <p className="text-xs text-muted-foreground">#{target.userId}</p>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            지급 포인트
          </label>
          <input
            ref={inputRef}
            className="input-common"
            type="number"
            min={1}
            value={amount || ''}
            onChange={(e) => setAmount(+e.target.value)}
            placeholder="포인트를 입력하세요"
            onKeyDown={(e) => e.key === 'Enter' && handleGrant()}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleGrant}
            disabled={granting || amount <= 0}
            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-40 transition-colors"
          >
            {granting ? '지급 중...' : `${amount > 0 ? amount.toLocaleString() + 'pt ' : ''}지급`}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/[0.1] text-sm font-medium text-muted-foreground hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersTab() {
  const [list, setList] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantTarget, setGrantTarget] = useState<GrantTarget | null>(null);

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
    <>
      {grantTarget && <GrantModal target={grantTarget} onClose={() => setGrantTarget(null)} />}

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
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">{fmtDate(u.createdAt)}</span>
                    <div className="text-[10px] text-muted-foreground mt-0.5">#{u.id}</div>
                  </div>
                  <button
                    onClick={() => setGrantTarget({ userId: u.id, nickname: u.nickname || u.name })}
                    className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                  >
                    포인트 지급
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
