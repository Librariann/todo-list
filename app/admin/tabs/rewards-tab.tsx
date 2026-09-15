'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, ImageIcon, PackageCheck, PackageX } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/app/lib/apiClient';
import { ActionBtn, Field } from './components';
import { Reward, RewardForm, RewardType, defaultRewardForm } from './types';
import ConfirmModal from '@/app/components/ConfirmModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function toLocalDateTime(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function rewardPayload(form: RewardForm) {
  return {
    ...form,
    imageUrl: form.imageUrl.trim() || null,
    availableFrom: form.availableFrom ? new Date(form.availableFrom).toISOString() : null,
  };
}

export default function RewardsTab() {
  const [list, setList] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<RewardForm>(defaultRewardForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Reward | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

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
      imageUrl: r.imageUrl ?? '',
      availableFrom: toLocalDateTime(r.availableFrom),
      exchangeEnabled: r.exchangeEnabled,
      stockQuantity: r.stockQuantity,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      let response: Response;
      if (editId !== null) {
        response = await apiFetch(`${API_URL}/api/rewards/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rewardPayload(form)),
        });
      } else {
        response = await apiFetch(`${API_URL}/api/rewards/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rewardPayload(form)),
        });
      }
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? '보상을 저장하지 못했어요.');
      }
      setShowForm(false);
      await fetchList();
      toast.success(editId !== null ? '보상을 수정했어요.' : '새 보상을 등록했어요.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '보상을 저장하지 못했어요.');
    } finally {
      setSaving(false);
    }
  }

  async function handleExchangeToggle(reward: Reward) {
    setTogglingId(reward.id);
    const nextValue = !reward.exchangeEnabled;
    setList((items) =>
      items.map((item) => (item.id === reward.id ? { ...item, exchangeEnabled: nextValue } : item))
    );
    try {
      const response = await apiFetch(`${API_URL}/api/rewards/${reward.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exchangeEnabled: nextValue }),
      });
      if (!response.ok) throw new Error('교환 상태를 변경하지 못했어요.');
      toast.success(nextValue ? '교환을 열었어요.' : '교환을 잠시 닫았어요.');
    } catch (error) {
      setList((items) =>
        items.map((item) =>
          item.id === reward.id ? { ...item, exchangeEnabled: reward.exchangeEnabled } : item
        )
      );
      toast.error(error instanceof Error ? error.message : '교환 상태를 변경하지 못했어요.');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      const response = await apiFetch(`${API_URL}/api/rewards/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('보상을 삭제하지 못했어요.');
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
                className="input-common"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="보상 이름"
              />
            </Field>
            <Field label="유형 *">
              <select
                className="input-common"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as RewardType }))}
              >
                <option value="POINT">포인트</option>
                <option value="COUPON">쿠폰</option>
              </select>
            </Field>
            <Field label="포인트 *">
              <input
                className="input-common"
                type="number"
                min={0}
                value={form.point}
                onChange={(e) => setForm((f) => ({ ...f, point: +e.target.value }))}
              />
            </Field>
            <Field label="설명">
              <input
                className="input-common"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="보상 설명"
              />
            </Field>
            <Field label="상품 이미지 URL" span2>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_6rem]">
                <input
                  className="input-common"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="공급사가 사용을 허용한 이미지 주소"
                />
                <div
                  className="flex h-20 items-center justify-center overflow-hidden rounded-xl bg-[#e3ece4] bg-cover bg-center text-[#63806d]"
                  style={form.imageUrl ? { backgroundImage: `url(${form.imageUrl})` } : undefined}
                >
                  {!form.imageUrl ? <ImageIcon className="h-5 w-5" /> : null}
                </div>
              </div>
            </Field>
            <Field label="교환 시작일">
              <input
                className="input-common"
                type="datetime-local"
                value={form.availableFrom}
                onChange={(e) => setForm((f) => ({ ...f, availableFrom: e.target.value }))}
              />
            </Field>
            <Field label={form.type === 'COUPON' ? '준비된 쿠폰 재고' : '재고 관리 안 함'}>
              <input
                className="input-common"
                type="number"
                min={0}
                disabled={form.type !== 'COUPON'}
                value={form.stockQuantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stockQuantity: Math.max(0, +e.target.value) }))
                }
              />
            </Field>
            <Field label="교환 운영">
              <button
                type="button"
                role="switch"
                aria-checked={form.exchangeEnabled}
                onClick={() => setForm((f) => ({ ...f, exchangeEnabled: !f.exchangeEnabled }))}
                className={`mt-1 flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                  form.exchangeEnabled
                    ? 'border-primary/25 bg-primary/10 text-primary'
                    : 'border-stone-200 bg-stone-50 text-muted-foreground dark:border-border dark:bg-muted'
                }`}
              >
                <span>{form.exchangeEnabled ? '교환 열림' : '교환 닫힘'}</span>
                <span
                  className={`relative h-5 w-9 rounded-full transition-colors ${form.exchangeEnabled ? 'bg-primary' : 'bg-stone-300 dark:bg-stone-600'}`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${form.exchangeEnabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`}
                  />
                </span>
              </button>
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
                  className="input-common"
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
              className="grid gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-4 transition-colors hover:border-primary/25 dark:border-white/[0.07] dark:bg-card sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:items-center"
            >
              <div
                className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-[#e3ece4] bg-cover bg-center text-[#54735f]"
                style={r.imageUrl ? { backgroundImage: `url(${r.imageUrl})` } : undefined}
              >
                {!r.imageUrl ? <PackageCheck className="h-5 w-5" /> : null}
              </div>
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
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                      r.exchangeEnabled
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                        : 'bg-stone-100 text-muted-foreground dark:bg-white/5'
                    }`}
                  >
                    {r.exchangeEnabled ? '교환 ON' : '교환 OFF'}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
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
                  {r.type === 'COUPON' ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      {r.stockQuantity > 0 ? (
                        <PackageCheck className="h-3.5 w-3.5" />
                      ) : (
                        <PackageX className="h-3.5 w-3.5" />
                      )}
                      재고 {r.stockQuantity}개
                    </span>
                  ) : null}
                  {r.availableFrom ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {new Date(r.availableFrom).toLocaleDateString('ko-KR')} 오픈
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-1.5 sm:justify-end">
                <ActionBtn
                  onClick={() => void handleExchangeToggle(r)}
                  disabled={togglingId === r.id}
                >
                  {r.exchangeEnabled ? '교환 끄기' : '교환 켜기'}
                </ActionBtn>
                <ActionBtn onClick={() => openEdit(r)}>수정</ActionBtn>
                <ActionBtn danger onClick={() => setDeleteTarget(r)} disabled={deletingId === r.id}>
                  {deletingId === r.id ? '...' : '삭제'}
                </ActionBtn>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmModal
        open={deleteTarget !== null}
        title="이 보상을 삭제할까요?"
        description={
          deleteTarget
            ? `‘${deleteTarget.name}’ 보상을 교환 목록에서 삭제해요.`
            : '선택한 보상을 삭제해요.'
        }
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (!deleteTarget) return;
          return handleDelete(deleteTarget.id);
        }}
      />
    </div>
  );
}
