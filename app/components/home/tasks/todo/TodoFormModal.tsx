'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Todo } from '@/app/types/todo';
import TaskModalLayout from '../TaskModalLayout';
import ReminderTimeFields from '../ReminderTimeFields';

export type TodoForm = { mode: 'create' } | { mode: 'edit' | 'reminder'; todo: Todo };

export type TodoFormInput =
  | { mode: 'create'; name: string; reminderAt?: string }
  | { mode: 'edit'; name: string }
  | { mode: 'reminder'; reminderAt: string | null };

type ReminderOption = 'none' | 'custom';

const selectClassName =
  'min-h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm';

const reminderClock = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

interface TodoFormModalProps {
  form: TodoForm | null;
  selectedDate: string;
  onClose: () => void;
  onSubmit: (input: TodoFormInput) => Promise<void>;
}

export default function TodoFormModal({
  form,
  selectedDate,
  onClose,
  onSubmit,
}: TodoFormModalProps) {
  const open = form !== null;
  const mode = form?.mode ?? 'create';
  const todo = form && form.mode !== 'create' ? form.todo : null;
  const targetDate = todo?.date ?? selectedDate;
  const showReminder = mode !== 'edit';
  const savedReminderTime = mode === 'reminder'
    ? todo?.reminderAt
      ? reminderClock.format(new Date(todo.reminderAt))
      : todo?.repeatReminderTime ?? null
    : null;
  const savedTitle = todo?.title ?? '';
  const [name, setName] = useState<string>('');
  const [reminderOption, setReminderOption] = useState<ReminderOption>('none');
  const [reminderHour, setReminderHour] = useState<string>('');
  const [reminderMinute, setReminderMinute] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const [hour = '', minute = ''] = savedReminderTime?.split(':') ?? [];
    setName(savedTitle);
    setReminderOption(savedReminderTime ? 'custom' : 'none');
    setReminderHour(hour);
    setReminderMinute(minute);
    setError(null);
  }, [open, mode, savedTitle, savedReminderTime, targetDate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (mode !== 'reminder' && !trimmedName) {
      setError('할 일 이름을 입력해주세요.');
      return;
    }

    let reminderAt: string | null = null;
    const customTime = `${reminderHour}:${reminderMinute}`;
    if (mode === 'reminder' && (reminderOption === 'none' ? !savedReminderTime : customTime === savedReminderTime)) {
      onClose();
      return;
    }
    if (showReminder && reminderOption === 'custom') {
      const time = new Date(`${targetDate}T${customTime}:00+09:00`);
      if (!Number.isFinite(time.getTime()) || time.getTime() <= Date.now()) {
        setError('지금보다 나중 시간으로 알림을 설정해주세요.');
        return;
      }
      reminderAt = time.toISOString();
    }

    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'reminder') {
        await onSubmit({ mode, reminderAt });
      } else if (mode === 'edit') {
        await onSubmit({ mode, name: trimmedName });
      } else {
        await onSubmit({ mode, name: trimmedName, reminderAt: reminderAt ?? undefined });
      }
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : mode === 'reminder'
            ? '알림 설정을 저장하지 못했어요.'
            : mode === 'edit'
              ? '할 일을 수정하지 못했어요.'
              : '할 일을 등록하지 못했어요.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const [, month, day] = targetDate.split('-');

  return (
    <TaskModalLayout
      open={open}
      title={mode === 'reminder' ? '할 일 알림 설정' : mode === 'edit' ? '할 일 수정' : '새 할 일 추가'}
      submitting={submitting}
      submitLabel={mode === 'create' ? '추가하기' : '저장하기'}
      submittingLabel={mode === 'create' ? '등록 중...' : '저장 중...'}
      onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}
      onSubmit={handleSubmit}
    >
      {mode !== 'reminder' ? (
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
          />
        </div>
      ) : null}

      <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
        {mode === 'reminder' ? (
          <span className="mb-1 block break-words font-semibold text-foreground [overflow-wrap:anywhere]">{savedTitle}</span>
        ) : null}
        {Number(month)}월 {Number(day)}일 할 일{mode === 'create' ? '로 등록해요.' : mode === 'edit' ? '이에요.' : ''}
      </p>

      {showReminder ? (
        <div className="min-w-0 space-y-2">
          <Label htmlFor="todo-reminder" className="text-sm font-medium">
            할 일 알림
          </Label>
          <select
            id="todo-reminder"
            value={reminderOption}
            onChange={(event) => setReminderOption(event.target.value as ReminderOption)}
            aria-describedby="todo-reminder-help"
            className={selectClassName}
          >
            <option value="none">알림 없음</option>
            <option value="custom">시간 지정</option>
          </select>
          {reminderOption === 'custom' ? (
            <fieldset className="min-w-0" aria-label="알림 시간 (한국 시간)">
              <ReminderTimeFields
                id="todo-reminder"
                hour={reminderHour}
                minute={reminderMinute}
                onHourChange={setReminderHour}
                onMinuteChange={setReminderMinute}
              />
            </fieldset>
          ) : null}
          <p id="todo-reminder-help" className="text-xs text-muted-foreground">
            {todo?.repeatDaily
              ? '매일 설정한 시간(한국 시간)에 알려드려요.'
              : '할 일 당일, 설정한 시간(한국 시간)에 알려드려요.'}
          </p>
        </div>
      ) : null}

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </TaskModalLayout>
  );
}
