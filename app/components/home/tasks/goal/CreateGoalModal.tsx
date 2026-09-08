'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TaskModalLayout from '../TaskModalLayout';
import type { GoalWithDate } from '@/app/types/todo';

export type GoalRecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface CreateGoalInput {
  name: string;
  recurrenceType: GoalRecurrenceType;
}

interface CreateGoalModalProps {
  open: boolean;
  selectedDate: string;
  goal?: GoalWithDate | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateGoalInput) => Promise<void>;
}

export default function CreateGoalModal({
  open,
  selectedDate,
  goal = null,
  onOpenChange,
  onSubmit,
}: CreateGoalModalProps) {
  const isEditing = goal !== null;
  const [name, setName] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<GoalRecurrenceType>('DAILY');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(goal?.title ?? '');
    setRecurrenceType('DAILY');
    setError(null);
  }, [open, goal]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('목표 이름을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name: trimmedName, recurrenceType });
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : isEditing
            ? '목표를 수정하지 못했습니다.'
            : '목표를 등록하지 못했습니다.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const [, month, day] = selectedDate.split('-');

  return (
    <TaskModalLayout
      open={open}
      title={isEditing ? '목표 이름 수정' : '새 목표 추가'}
      submitting={submitting}
      submitLabel={isEditing ? '저장하기' : '추가하기'}
      submittingLabel={isEditing ? '저장 중...' : '등록 중...'}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
    >
      <div>
        <Label htmlFor="goal-name" className="mb-2 text-sm font-medium">
          목표 이름
        </Label>
        <Input
          id="goal-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="꾸준히 달성하고 싶은 목표"
          maxLength={50}
          autoFocus
        />
      </div>

      {isEditing ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          이름만 바꿀 수 있어요. 반복 주기와 시작일을 바꾸면 지금까지 쌓인 진행 기록과 어긋나기
          때문이에요.
        </p>
      ) : (
        <>
          <div>
            <Label className="mb-2 text-sm font-medium">반복 주기</Label>
            <Select
              value={recurrenceType}
              onValueChange={(value) => setRecurrenceType(value as GoalRecurrenceType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">매일</SelectItem>
                <SelectItem value="WEEKLY">매주</SelectItem>
                <SelectItem value="MONTHLY">매월</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            목표는 {Number(month)}월 {Number(day)}일부터 시작해요.
          </p>
        </>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </TaskModalLayout>
  );
}
