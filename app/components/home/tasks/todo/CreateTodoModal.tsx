'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TaskModalLayout from '../TaskModalLayout';
import type { Todo } from '@/app/types/todo';

export interface CreateTodoInput {
  name: string;
}

interface CreateTodoModalProps {
  open: boolean;
  selectedDate: string;
  todo?: Todo | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateTodoInput) => Promise<void>;
}

export default function CreateTodoModal({
  open,
  selectedDate,
  todo = null,
  onOpenChange,
  onSubmit,
}: CreateTodoModalProps) {
  const isEditing = todo !== null;
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(todo?.title ?? '');
    setError(null);
  }, [open, todo]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('할 일 이름을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name: trimmedName });
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : isEditing
            ? '할 일을 수정하지 못했습니다.'
            : '할 일을 등록하지 못했습니다.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const [, month, day] = selectedDate.split('-');

  return (
    <TaskModalLayout
      open={open}
      title={isEditing ? '할 일 수정' : '새 할 일 추가'}
      submitting={submitting}
      submitLabel={isEditing ? '저장하기' : '추가하기'}
      submittingLabel={isEditing ? '저장 중...' : '등록 중...'}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
    >
      <div>
        <Label htmlFor="todo-name" className="mb-2 text-sm font-medium">
          할 일 이름
        </Label>
        <Input
          id="todo-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="이번에 끝내고 싶은 일"
          maxLength={50}
          autoFocus
        />
      </div>

      <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
        {Number(month)}월 {Number(day)}일 할 일{isEditing ? '이에요.' : '로 등록해요.'}
      </p>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </TaskModalLayout>
  );
}
