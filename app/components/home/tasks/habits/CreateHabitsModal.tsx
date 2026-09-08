'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TaskModalLayout from '../TaskModalLayout';
import type { Habit } from '@/app/types/todo';

export interface CreateHabitInput {
  name: string;
  dailyTarget: number;
}

interface CreateHabitsModalProps {
  open: boolean;
  habit?: Habit | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateHabitInput) => Promise<void>;
}

export default function CreateHabitsModal({
  open,
  habit = null,
  onOpenChange,
  onSubmit,
}: CreateHabitsModalProps) {
  const isEditing = habit !== null;
  const [name, setName] = useState('');
  const [dailyTarget, setDailyTarget] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(habit?.title ?? '');
    setDailyTarget(habit?.dailyTarget ?? 5);
    setError(null);
  }, [open, habit]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('습관 이름을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name: trimmedName, dailyTarget });
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : isEditing
            ? '습관을 수정하지 못했습니다.'
            : '습관을 등록하지 못했습니다.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TaskModalLayout
      open={open}
      title={isEditing ? '습관 수정' : '새 습관 추가'}
      submitting={submitting}
      submitLabel={isEditing ? '저장하기' : '추가하기'}
      submittingLabel={isEditing ? '저장 중...' : '등록 중...'}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
    >
      <div>
        <Label htmlFor="habit-name" className="mb-2 text-sm font-medium">
          습관 이름
        </Label>
        <Input
          id="habit-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="매일 이어가고 싶은 행동"
          maxLength={50}
          autoFocus
        />
      </div>

      <div>
        <Label htmlFor="habit-daily-target" className="mb-2 text-sm font-medium">
          하루 목표 횟수
        </Label>
        <Input
          id="habit-daily-target"
          type="number"
          min={1}
          max={50}
          value={dailyTarget}
          onChange={(event) => setDailyTarget(Math.max(1, Number(event.target.value) || 1))}
        />
        <p className="mt-1 text-xs text-muted-foreground">하루에 몇 번 실천할지 정해주세요.</p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </TaskModalLayout>
  );
}
