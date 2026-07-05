'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TaskModalLayout from '../TaskModalLayout';

export interface CreateTodoInput {
  name: string;
}

interface CreateTodoModalProps {
  open: boolean;
  selectedDate: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateTodoInput) => Promise<void>;
}

export default function CreateTodoModal({
  open,
  selectedDate,
  onOpenChange,
  onSubmit,
}: CreateTodoModalProps) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) return;
    setName('');
    setError(null);
  }, [open]);

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
      setError(submitError instanceof Error ? submitError.message : '할 일을 등록하지 못했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const [, month, day] = selectedDate.split('-');

  return (
    <TaskModalLayout
      open={open}
      title="새 할 일 추가"
      submitting={submitting}
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
        {Number(month)}월 {Number(day)}일 할 일로 등록해요.
      </p>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </TaskModalLayout>
  );
}
