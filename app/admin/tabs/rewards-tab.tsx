'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/app/lib/apiClient';
import { ActionBtn, Field } from './components';
import { Reward, RewardForm, RewardType, defaultRewardForm } from './types';
import ConfirmModal from '@/app/components/ConfirmModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RewardsTab() {
  const [list, setList] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<RewardForm>(defaultRewardForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Reward | null>(null);

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
              className="flex items-center gap-3 bg-white dark:bg-card border border-stone-200 dark:border-white/[0.07] rounded-xl px-4 py-3 hover:shadow-sm transition-shadow"
            >
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
