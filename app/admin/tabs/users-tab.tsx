'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '@/app/lib/apiClient';
import { AdminUser, UserStatus } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

async function responseError(response: Response, fallback: string): Promise<Error> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    const message = Array.isArray(body.message) ? body.message[0] : body.message;
    return new Error(message || fallback);
  } catch {
    return new Error(fallback);
  }
}

interface GrantTarget {
  userId: number;
  nickname: string;
  pointBalance: number;
}

interface GrantModalProps {
  target: GrantTarget;
  onClose: () => void;
  onGranted: () => void | Promise<void>;
}

function GrantModal({ target, onClose, onGranted }: GrantModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [granting, setGranting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !granting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [granting, onClose]);

  async function handleGrant() {
    if (amount <= 0) return;
    setGranting(true);
    setError(null);
    try {
      const response = await apiFetch(`${API_URL}/api/user/points/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: target.userId, point: amount }),
      });
      if (!response.ok) throw await responseError(response, '포인트를 지급하지 못했어요.');
      await onGranted();
      onClose();
    } catch (grantError) {
      setError(grantError instanceof Error ? grantError.message : '포인트를 지급하지 못했어요.');
    } finally {
      setGranting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !granting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="grant-title"
        className="w-full max-w-sm overflow-hidden rounded-[1.5rem] border border-stone-200 bg-background shadow-xl dark:border-white/[0.1]"
      >
        <div className="px-6 pb-5 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-primary">운영자 지급</p>
              <h3 id="grant-title" className="friendly-heading mt-1 text-xl font-bold text-foreground">
                {target.nickname}님에게 포인트 지급
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={granting}
              aria-label="닫기"
              className="min-h-11 min-w-11 rounded-xl text-lg text-muted-foreground transition-colors hover:bg-stone-100 hover:text-foreground disabled:opacity-40 dark:hover:bg-white/5"
            >
              ×
            </button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            현재 잔액{' '}
            <strong className="font-bold text-foreground">
              {target.pointBalance.toLocaleString()} P
            </strong>
          </p>

          <label className="mt-5 block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              지급 포인트
            </span>
            <input
              ref={inputRef}
              className="input-common"
              type="number"
              min={1}
              value={amount || ''}
              onChange={(event) => setAmount(Number(event.currentTarget.value))}
              placeholder="지급할 포인트를 입력하세요"
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleGrant();
              }}
            />
          </label>

          {error ? (
            <p role="alert" className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-stone-200 px-6 py-4 dark:border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            disabled={granting}
            className="min-h-11 rounded-xl border border-stone-200 text-sm font-semibold text-muted-foreground transition-colors hover:bg-stone-50 dark:border-white/[0.1] dark:hover:bg-white/5"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleGrant}
            disabled={granting || amount <= 0}
            className="min-h-11 rounded-xl bg-primary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-35"
          >
            {granting ? '지급 중' : amount > 0 ? `${amount.toLocaleString()} P 지급` : '지급'}
          </button>
        </div>
      </div>
    </div>
  );
}

function statusLabel(status: UserStatus): string {
  if (status === 'ACTIVE') return '활성';
  if (status === 'INACTIVE') return '비활성';
  if (status === 'SUSPENDED') return '정지';
  return '탈퇴';
}

function statusClassName(status: UserStatus): string {
  if (status === 'ACTIVE') return 'bg-primary/10 text-primary';
  if (status === 'SUSPENDED') {
    return 'bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-300';
  }
  return 'bg-stone-100 text-stone-600 dark:bg-white/[0.06] dark:text-muted-foreground';
}

export default function UsersTab() {
  const [list, setList] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [grantTarget, setGrantTarget] = useState<GrantTarget | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`${API_URL}/api/users/admin/assets`);
      if (!response.ok) {
        throw await responseError(response, '사용자 자산을 불러오지 못했어요.');
      }
      const body = (await response.json()) as { data?: AdminUser[] };
      setList(body.data ?? []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : '사용자 자산을 불러오지 못했어요.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const filteredList = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR');
    if (!normalizedQuery) return list;
    return list.filter((user) =>
      [user.nickname, user.name ?? '', user.email, String(user.id)].some((value) =>
        value.toLocaleLowerCase('ko-KR').includes(normalizedQuery)
      )
    );
  }, [list, query]);

  const totals = useMemo(
    () => ({
      points: list.reduce((sum, user) => sum + user.pointBalance, 0),
      coupons: list.reduce((sum, user) => sum + user.coupons.length, 0),
      availableCoupons: list.reduce(
        (sum, user) => sum + user.coupons.filter((coupon) => !coupon.isUsed).length,
        0
      ),
    }),
    [list]
  );

  return (
    <div className="space-y-5">
      {grantTarget ? (
        <GrantModal
          target={grantTarget}
          onClose={() => setGrantTarget(null)}
          onGranted={fetchList}
        />
      ) : null}

      <section className="overflow-hidden rounded-[1.5rem] bg-[oklch(0.965_0.025_145)] px-5 py-5 dark:bg-primary/5 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div>
            <p className="text-xs font-semibold text-primary">사용자 자산 현황</p>
            <h2 className="friendly-heading mt-1 text-xl font-bold text-foreground">
              {list.length}명의 포인트와 쿠폰
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              지급된 자산과 사용 여부를 한곳에서 확인해요.
            </p>
          </div>
          <dl className="flex gap-7">
            <div>
              <dt className="text-[11px] font-semibold text-muted-foreground">보유 포인트 합계</dt>
              <dd className="mt-1 text-lg font-bold text-foreground">
                {totals.points.toLocaleString()} P
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold text-muted-foreground">사용 가능한 쿠폰</dt>
              <dd className="mt-1 text-lg font-bold text-foreground">
                {totals.availableCoupons.toLocaleString()}
                <span className="ml-1 text-xs font-semibold text-muted-foreground">
                  / {totals.coupons}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
        <label className="block w-full sm:max-w-sm">
          <span className="sr-only">사용자 검색</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="닉네임, 이메일 또는 사용자 번호 검색"
            className="min-h-11 w-full rounded-xl border border-stone-200 bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary dark:border-white/[0.1]"
          />
        </label>
        <p className="text-xs font-semibold text-muted-foreground">
          {query ? `${filteredList.length}명 검색됨` : '최근 가입 순'}
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 dark:bg-red-400/10 dark:text-red-300">
          {error}
          <button type="button" onClick={fetchList} className="ml-3 underline underline-offset-4">
            다시 불러오기
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-2xl bg-stone-100 dark:bg-white/5" />
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          {query ? '검색 조건에 맞는 사용자가 없어요.' : '아직 등록된 사용자가 없어요.'}
        </div>
      ) : (
        <div className="divide-y divide-stone-200 border-y border-stone-200 dark:divide-white/[0.08] dark:border-white/[0.08]">
          {filteredList.map((user) => {
            const availableCoupons = user.coupons.filter((coupon) => !coupon.isUsed).length;
            const isExpanded = expandedId === user.id;
            const displayName = user.nickname || user.name || `사용자 ${user.id}`;

            return (
              <article key={user.id}>
                <div className="grid gap-4 py-4 sm:grid-cols-[minmax(0,1.35fr)_8.5rem_8.5rem_auto] sm:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {displayName[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-bold text-foreground">{displayName}</h3>
                        {user.role === 'ADMIN' ? (
                          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                            ADMIN
                          </span>
                        ) : null}
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${statusClassName(user.status)}`}
                        >
                          {statusLabel(user.status)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {user.email} · #{user.id} · {formatDate(user.createdAt)} 가입
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground">현재 포인트</p>
                    <p className="mt-0.5 text-base font-bold text-foreground">
                      {user.pointBalance.toLocaleString()} P
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground">보유 쿠폰</p>
                    <p className="mt-0.5 text-base font-bold text-foreground">
                      {availableCoupons}장
                      <span className="ml-1 text-[11px] font-semibold text-muted-foreground">
                        전체 {user.coupons.length}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setGrantTarget({
                          userId: user.id,
                          nickname: displayName,
                          pointBalance: user.pointBalance,
                        })
                      }
                      className="min-h-11 rounded-xl bg-primary/10 px-3 text-xs font-bold text-primary transition-colors hover:bg-primary/15"
                    >
                      포인트 지급
                    </button>
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={`user-coupons-${user.id}`}
                      onClick={() => setExpandedId(isExpanded ? null : user.id)}
                      className="min-h-11 rounded-xl border border-stone-200 px-3 text-xs font-bold text-muted-foreground transition-colors hover:bg-stone-50 hover:text-foreground dark:border-white/[0.1] dark:hover:bg-white/5"
                    >
                      {isExpanded ? '쿠폰 접기' : '쿠폰 보기'}
                    </button>
                  </div>
                </div>

                {isExpanded ? (
                  <div
                    id={`user-coupons-${user.id}`}
                    className="mb-4 rounded-2xl bg-[oklch(0.975_0.012_100)] px-4 py-2 dark:bg-white/[0.035] sm:ml-[3.25rem]"
                  >
                    {user.coupons.length === 0 ? (
                      <p className="py-5 text-sm text-muted-foreground">아직 교환한 쿠폰이 없어요.</p>
                    ) : (
                      <ul className="divide-y divide-stone-200 dark:divide-white/[0.08]">
                        {user.coupons.map((coupon) => (
                          <li
                            key={coupon.id}
                            className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_7rem_6rem] sm:items-center"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-foreground">{coupon.name}</p>
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {coupon.description || '쿠폰 설명 없음'} · {formatDate(coupon.createdAt)} 교환
                              </p>
                            </div>
                            <p className="text-xs font-semibold text-muted-foreground sm:text-right">
                              {coupon.point.toLocaleString()} P
                            </p>
                            <span
                              className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-bold sm:justify-self-end ${
                                coupon.isUsed
                                  ? 'bg-stone-200 text-stone-600 dark:bg-white/10 dark:text-muted-foreground'
                                  : 'bg-[oklch(0.9_0.08_145)] text-[oklch(0.38_0.11_145)] dark:bg-primary/15 dark:text-primary'
                              }`}
                            >
                              {coupon.isUsed ? '사용 완료' : '사용 가능'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
