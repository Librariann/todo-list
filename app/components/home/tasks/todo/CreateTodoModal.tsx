'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TodoStatus, type Todo } from '@/app/types/todo';
import TaskModalLayout from '../TaskModalLayout';
import ReminderTimeFields from '../ReminderTimeFields';

export interface CreateTodoInput {
  name: string;
  reminderAt?: string | null;
}

type ReminderOption = 'none' | 'custom';

const selectClassName =
  'min-h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm';

const reminderClock = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

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
  const canSetReminder = todo?.status !== TodoStatus.DONE;
  const savedReminderTime = todo?.reminderAt
    ? reminderClock.format(new Date(todo.reminderAt))
    : todo?.repeatReminderTime ?? null;
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
  }, [open, savedTitle, savedReminderTime, selectedDate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('할 일 이름을 입력해주세요.');
      return;
    }

    let reminderAt: string | null | undefined;
    const customTime = `${reminderHour}:${reminderMinute}`;
    if (canSetReminder) {
      if (reminderOption === 'none') {
        reminderAt = savedReminderTime ? null : undefined;
      } else if (customTime !== savedReminderTime) {
        const time = new Date(`${selectedDate}T${customTime}:00+09:00`);
        if (!Number.isFinite(time.getTime()) || time.getTime() <= Date.now()) {
          setError('지금보다 나중 시간으로 알림을 설정해주세요.');
          return;
        }
        reminderAt = time.toISOString();
      }
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name: trimmedName, reminderAt });
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
        />
      </div>

      <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
        {Number(month)}월 {Number(day)}일 할 일{isEditing ? '이에요.' : '로 등록해요.'}
      </p>

      {canSetReminder ? (
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
            할 일 당일, 설정한 시간(한국 시간)에 알려드려요.
          </p>
        </div>
      ) : null}

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </TaskModalLayout>
  );
}
