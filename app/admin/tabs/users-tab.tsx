'use client';

import { useEffect, useState } from 'react';
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

export default function UsersTab() {
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
