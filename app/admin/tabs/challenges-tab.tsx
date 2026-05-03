'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/app/lib/apiClient';
import { ActionBtn, Field } from './components';
import { Challenge, ChallengeForm, RecurrenceType, WorkType, defaultChallengeForm } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ChallengesTab() {
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
      isActive: c.isActive,
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
            isActive: form.isActive,
          }),
        });
      } else {
        console.log(form);
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
                className="input-common"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="도전과제 이름"
              />
            </Field>
            <Field label="아이콘">
              <input
                className="input-common"
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="🏆"
              />
            </Field>
            <Field label="설명" span2>
              <input
                className="input-common"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="도전과제 설명"
              />
            </Field>
            <Field label="반복 주기 *">
              <select
                className="input-common"
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
                className="input-common"
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
                className="input-common"
                type="number"
                min={1}
                value={form.targetCount}
                onChange={(e) => setForm((f) => ({ ...f, targetCount: +e.target.value }))}
              />
            </Field>
            {!editId && (
              <Field label="일일 최대 횟수 *">
                <input
                  className="input-common"
                  type="number"
                  min={1}
                  value={form.dailyMaxCount}
                  onChange={(e) => setForm((f) => ({ ...f, dailyMaxCount: +e.target.value }))}
                />
              </Field>
            )}
            <Field label="보상 포인트 *">
              <input
                className="input-common"
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
