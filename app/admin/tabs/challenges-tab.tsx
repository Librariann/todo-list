'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/app/lib/apiClient';
import { ActionBtn, Field } from './components';
import {
  Challenge,
  ChallengeForm,
  ChallengeRotationSetting,
  RecurrenceType,
  WorkType,
  defaultChallengeForm,
} from './types';
import ConfirmModal from '@/app/components/ConfirmModal';
import ChallengeRotationOperations from './challenge-rotation-operations';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const workTypeLabel: Record<WorkType, string> = {
  HABITS: '습관',
  TODOS: '할 일',
  GOALS: '목표',
};

const recurrenceLabel: Record<RecurrenceType, string> = {
  DAILY: '매일',
  WEEKLY: '매주',
  MONTHLY: '매월',
};

const recurrenceTabs: { value: RecurrenceType; label: string; description: string }[] = [
  { value: 'DAILY', label: '일일', description: '매일 새롭게' },
  { value: 'WEEKLY', label: '주간', description: '월요일마다' },
  { value: 'MONTHLY', label: '월간', description: '매월 1일마다' },
];

const defaultRotationCounts: Record<RecurrenceType, number> = {
  DAILY: 5,
  WEEKLY: 5,
  MONTHLY: 5,
};

const defaultCooldownPeriods: Record<RecurrenceType, number> = {
  DAILY: 3,
  WEEKLY: 2,
  MONTHLY: 2,
};

const nextRotationLabel: Record<RecurrenceType, string> = {
  DAILY: '다음 날',
  WEEKLY: '다음 주',
  MONTHLY: '다음 달',
};

const cooldownUnit: Record<RecurrenceType, string> = {
  DAILY: '일',
  WEEKLY: '주',
  MONTHLY: '개월',
};

interface SettingStepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}

function SettingStepper({ label, value, min, max, suffix, onChange }: SettingStepperProps) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold text-muted-foreground">{label}</p>
      <div className="flex min-h-11 items-center overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-white/[0.1] dark:bg-card">
        <button
          type="button"
          aria-label={`${label} 줄이기`}
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          className="min-h-11 min-w-11 text-lg font-medium text-muted-foreground transition-colors hover:bg-stone-50 hover:text-foreground disabled:opacity-30 dark:hover:bg-white/5"
        >
          −
        </button>
        <label className="flex h-11 items-center border-x border-stone-200 dark:border-white/[0.1]">
          <span className="sr-only">{label}</span>
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(event) => onChange(event.currentTarget.valueAsNumber || min)}
            className="h-full w-12 bg-transparent text-right text-sm font-bold text-foreground outline-none"
          />
          <span className="w-8 pr-2 text-xs font-semibold text-muted-foreground">{suffix}</span>
        </label>
        <button
          type="button"
          aria-label={`${label} 늘리기`}
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          className="min-h-11 min-w-11 text-lg font-medium text-muted-foreground transition-colors hover:bg-stone-50 hover:text-foreground disabled:opacity-30 dark:hover:bg-white/5"
        >
          +
        </button>
      </div>
    </div>
  );
}

function formatAdminDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export default function ChallengesTab() {
  const [list, setList] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ChallengeForm>(defaultChallengeForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Challenge | null>(null);
  const [activeRecurrence, setActiveRecurrence] = useState<RecurrenceType>('DAILY');
  const [rotationCounts, setRotationCounts] =
    useState<Record<RecurrenceType, number>>(defaultRotationCounts);
  const [savedRotationCounts, setSavedRotationCounts] =
    useState<Record<RecurrenceType, number>>(defaultRotationCounts);
  const [cooldownPeriods, setCooldownPeriods] =
    useState<Record<RecurrenceType, number>>(defaultCooldownPeriods);
  const [savedCooldownPeriods, setSavedCooldownPeriods] =
    useState<Record<RecurrenceType, number>>(defaultCooldownPeriods);
  const [savingRotation, setSavingRotation] = useState(false);
  const [rotationFeedback, setRotationFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const filteredList = useMemo(
    () => list.filter((challenge) => challenge.recurrenceType === activeRecurrence),
    [activeRecurrence, list]
  );

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const [res, settingsRes] = await Promise.all([
        apiFetch(`${API_URL}/api/challenges/`),
        apiFetch(`${API_URL}/api/challenges/rotation-settings`),
      ]);
      if (res.ok) {
        const d = await res.json();
        setList(d.data ?? []);
      }
      if (settingsRes.ok) {
        const response = await settingsRes.json();
        const settings = (response.data ?? []) as ChallengeRotationSetting[];
        const nextCounts = settings.reduce<Record<RecurrenceType, number>>(
          (counts, setting) => ({
            ...counts,
            [setting.periodType]: setting.selectionCount,
          }),
          defaultRotationCounts
        );
        const nextCooldownPeriods = settings.reduce<Record<RecurrenceType, number>>(
          (periods, setting) => ({
            ...periods,
            [setting.periodType]: setting.cooldownPeriods,
          }),
          defaultCooldownPeriods
        );
        setRotationCounts(nextCounts);
        setSavedRotationCounts(nextCounts);
        setCooldownPeriods(nextCooldownPeriods);
        setSavedCooldownPeriods(nextCooldownPeriods);
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
    setForm({ ...defaultChallengeForm, recurrenceType: activeRecurrence });
    setShowForm(true);
  }

  function openEdit(c: Challenge) {
    setEditId(c.id);
    setForm({
      name: c.name,
      description: c.description,
      icon: c.icon || '',
      recurrenceType: c.recurrenceType,
      targetCount: c.targetCount,
      dailyMaxCount: c.dailyMaxCount,
      workType: c.workType,
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
            workType: form.workType,
            targetCount: form.targetCount,
            dailyMaxCount: form.dailyMaxCount,
            point: form.point,
            isActive: form.isActive,
          }),
        });
      } else {
        await apiFetch(`${API_URL}/api/challenges/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      setActiveRecurrence(form.recurrenceType);
      setShowForm(false);
      await fetchList();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      const response = await apiFetch(`${API_URL}/api/challenges/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('도전과제를 삭제하지 못했어요.');
      await fetchList();
    } finally {
      setDeletingId(null);
    }
  }

  function handleRotationCountChange(value: number) {
    const selectionCount = Math.min(50, Math.max(1, value));
    setRotationCounts((counts) => ({
      ...counts,
      [activeRecurrence]: selectionCount,
    }));
    setRotationFeedback(null);
  }

  function handleCooldownChange(value: number) {
    const nextCooldownPeriods = Math.min(30, Math.max(0, value));
    setCooldownPeriods((periods) => ({
      ...periods,
      [activeRecurrence]: nextCooldownPeriods,
    }));
    setRotationFeedback(null);
  }

  async function handleRotationCountSave() {
    const selectionCount = rotationCounts[activeRecurrence];
    const cooldownPeriodCount = cooldownPeriods[activeRecurrence];
    setSavingRotation(true);
    setRotationFeedback(null);

    try {
      const response = await apiFetch(
        `${API_URL}/api/challenges/rotation-settings/${activeRecurrence}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectionCount,
            cooldownPeriods: cooldownPeriodCount,
          }),
        }
      );
      if (!response.ok) throw new Error('노출 개수를 저장하지 못했어요.');

      setSavedRotationCounts((counts) => ({
        ...counts,
        [activeRecurrence]: selectionCount,
      }));
      setSavedCooldownPeriods((periods) => ({
        ...periods,
        [activeRecurrence]: cooldownPeriodCount,
      }));
      setRotationFeedback({
        type: 'success',
        message: `${nextRotationLabel[activeRecurrence]}부터 ${selectionCount}개씩, ${cooldownPeriodCount}${cooldownUnit[activeRecurrence]}의 반복 대기를 적용해요.`,
      });
    } catch (error) {
      setRotationFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : '노출 개수를 저장하지 못했어요.',
      });
    } finally {
      setSavingRotation(false);
    }
  }

  const activeCount = filteredList.filter((challenge) => challenge.isActive).length;
  const selectedCount = filteredList.filter((challenge) => challenge.isSelected).length;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[1.5rem] border border-primary/15 bg-[oklch(0.975_0.015_145)] dark:bg-card">
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="mb-1 text-xs font-semibold tracking-wide text-primary">
              도전과제 운영 현황
            </p>
            <h2 className="friendly-heading text-xl font-bold text-foreground">
              {recurrenceTabs.find(({ value }) => value === activeRecurrence)?.label} 도전과제{' '}
              {filteredList.length}개
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              순환 후보 {activeCount}개 중 이번 기간에는 {selectedCount}개가 노출되고 있어요.
            </p>
          </div>
          <div className="flex gap-5 text-sm">
            {(['HABITS', 'TODOS', 'GOALS'] as WorkType[]).map((type) => (
              <div key={type} className="min-w-12">
                <span className="block text-xs text-muted-foreground">{workTypeLabel[type]}</span>
                <strong className="mt-0.5 block text-lg text-foreground">
                  {filteredList.filter((challenge) => challenge.workType === type).length}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-stone-200 dark:border-white/[0.08] sm:flex-row sm:items-end sm:justify-between">
        <div
          className="grid w-full grid-cols-3 sm:w-auto sm:min-w-[30rem]"
          role="tablist"
          aria-label="도전과제 반복 주기"
        >
          {recurrenceTabs.map((tab) => {
            const isSelected = activeRecurrence === tab.value;
            const count = list.filter((challenge) => challenge.recurrenceType === tab.value).length;

            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setActiveRecurrence(tab.value);
                  setRotationFeedback(null);
                }}
                className={`relative min-h-14 px-3 pb-3 pt-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-4 ${
                  isSelected ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm font-bold">{tab.label}</span>
                  <span
                    className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold ${
                      isSelected
                        ? 'bg-primary/10 text-primary'
                        : 'bg-stone-100 text-stone-500 dark:bg-white/[0.06] dark:text-muted-foreground'
                    }`}
                  >
                    {count}
                  </span>
                </span>
                <span className="mt-0.5 hidden text-[11px] font-medium opacity-70 sm:block">
                  {tab.description}
                </span>
                {isSelected && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary sm:inset-x-4" />
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={openCreate}
          className="mb-3 min-h-11 self-end rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {recurrenceTabs.find(({ value }) => value === activeRecurrence)?.label} 도전과제 등록
        </button>
      </div>

      <section className="flex flex-col gap-4 rounded-[1.25rem] bg-[oklch(0.975_0.012_100)] px-4 py-4 dark:bg-white/[0.035] sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p id="rotation-count-title" className="text-sm font-bold text-foreground">
            {recurrenceTabs.find(({ value }) => value === activeRecurrence)?.label} 순환 설정
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            변경한 설정은 {nextRotationLabel[activeRecurrence]} 도전과제를 고를 때부터 적용돼요.
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            새 후보가 부족하면 가장 오래전에 나온 도전과제부터 반복 대기를 완화해요.
          </p>
          {activeCount < rotationCounts[activeRecurrence] && (
            <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-300">
              순환 후보가 {activeCount}개라 현재 후보로는 최대 {activeCount}개까지 보여줄 수 있어요.
            </p>
          )}
          {rotationFeedback && (
            <p
              role="status"
              className={`mt-1 text-xs font-semibold ${
                rotationFeedback.type === 'success'
                  ? 'text-primary'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {rotationFeedback.message}
            </p>
          )}
        </div>

        <div
          className="flex flex-wrap items-end justify-end gap-2"
          aria-labelledby="rotation-count-title"
        >
          <SettingStepper
            label="한 번에 노출"
            value={rotationCounts[activeRecurrence]}
            min={1}
            max={50}
            suffix="개"
            onChange={handleRotationCountChange}
          />
          <SettingStepper
            label="반복 대기"
            value={cooldownPeriods[activeRecurrence]}
            min={0}
            max={30}
            suffix={cooldownUnit[activeRecurrence]}
            onChange={handleCooldownChange}
          />
          <button
            type="button"
            onClick={handleRotationCountSave}
            disabled={
              savingRotation ||
              (rotationCounts[activeRecurrence] === savedRotationCounts[activeRecurrence] &&
                cooldownPeriods[activeRecurrence] === savedCooldownPeriods[activeRecurrence])
            }
            className="min-h-11 rounded-xl bg-foreground px-4 text-sm font-bold text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {savingRotation ? '저장 중' : '적용'}
          </button>
        </div>
      </section>

      <ChallengeRotationOperations periodType={activeRecurrence} onRerolled={fetchList} />

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
            <Field label="하루 인정 한도 *">
              <input
                className="input-common"
                type="number"
                min={1}
                value={form.dailyMaxCount}
                onChange={(e) => setForm((f) => ({ ...f, dailyMaxCount: +e.target.value }))}
              />
            </Field>
            <Field label="보상 포인트 *">
              <input
                className="input-common"
                type="number"
                min={0}
                value={form.point}
                onChange={(e) => setForm((f) => ({ ...f, point: +e.target.value }))}
              />
            </Field>
            <Field label="순환 후보">
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-primary rounded"
                />
                <span className="text-sm text-muted-foreground">
                  다음 기간의 무작위 선발 후보에 포함
                </span>
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
      ) : filteredList.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          등록된 {recurrenceTabs.find(({ value }) => value === activeRecurrence)?.label} 도전과제가
          없습니다
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((c) => (
            <article
              key={c.id}
              className="group overflow-hidden rounded-[1.25rem] border border-stone-200 bg-[oklch(0.99_0.006_100)] transition-colors hover:border-primary/35 dark:border-white/[0.07] dark:bg-card"
            >
              <div className="grid md:grid-cols-[minmax(220px,0.8fr)_minmax(0,2fr)]">
                <div className="flex flex-col justify-between bg-[oklch(0.965_0.025_145)] px-5 py-5 dark:bg-primary/5">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                        {workTypeLabel[c.workType]}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          c.isActive
                            ? 'bg-[oklch(0.89_0.09_145)] text-[oklch(0.37_0.11_145)] dark:bg-primary/15 dark:text-primary'
                            : 'bg-stone-200 text-stone-600 dark:bg-white/10 dark:text-muted-foreground'
                        }`}
                      >
                        {c.isActive ? '순환 후보' : '순환 제외'}
                      </span>
                      {c.isSelected && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                          이번 기간 노출
                        </span>
                      )}
                    </div>
                    <h3 className="friendly-heading text-lg font-bold leading-snug text-foreground">
                      {c.name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {c.description || '설명이 등록되지 않았어요.'}
                    </p>
                  </div>
                  <p className="mt-5 text-[11px] text-muted-foreground">
                    등록 {formatAdminDate(c.createdAt)}
                    {c.updatedAt !== c.createdAt && ` · 수정 ${formatAdminDate(c.updatedAt)}`}
                  </p>
                </div>

                <div className="flex min-w-0 flex-col justify-between px-5 py-5 sm:px-6">
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                    <div>
                      <dt className="text-[11px] font-medium text-muted-foreground">반복 주기</dt>
                      <dd className="mt-1 text-sm font-bold text-foreground">
                        {recurrenceLabel[c.recurrenceType]}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium text-muted-foreground">달성 조건</dt>
                      <dd className="mt-1 text-sm font-bold text-foreground">
                        기간 내 {c.targetCount.toLocaleString()}회
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium text-muted-foreground">
                        하루 인정 한도
                      </dt>
                      <dd className="mt-1 text-sm font-bold text-foreground">
                        최대 {c.dailyMaxCount.toLocaleString()}회
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium text-muted-foreground">달성 보상</dt>
                      <dd className="mt-1 text-sm font-bold text-primary">
                        {c.point.toLocaleString()} P
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-200/80 pt-4 dark:border-white/[0.07]">
                    <span className="text-xs text-muted-foreground">도전과제 #{c.id}</span>
                    <div className="flex gap-1.5">
                      <ActionBtn onClick={() => openEdit(c)}>수정</ActionBtn>
                      <ActionBtn
                        danger
                        onClick={() => setDeleteTarget(c)}
                        disabled={deletingId === c.id}
                      >
                        {deletingId === c.id ? '...' : '삭제'}
                      </ActionBtn>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <ConfirmModal
        open={deleteTarget !== null}
        title="이 도전과제를 삭제할까요?"
        description={
          deleteTarget
            ? `‘${deleteTarget.name}’ 도전과제와 관련 설정을 삭제해요.`
            : '선택한 도전과제를 삭제해요.'
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
