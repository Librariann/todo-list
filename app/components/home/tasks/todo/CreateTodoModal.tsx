'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TodoStatus, type Todo } from '@/app/types/todo';
import Calendar from '@/app/components/Calendar';
import TaskModalLayout from '../TaskModalLayout';
import ReminderTimeFields from '../ReminderTimeFields';

export interface CreateTodoInput {
  name: string;
  reminderAt?: string | null;
}

type ReminderOption = 'none' | '10' | '60' | 'custom';

const selectClassName =
  'min-h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm';

function toLocalDateTime(value: string): string {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
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
  const canSetReminder = todo?.status !== TodoStatus.DONE;
  const existingReminderAt = todo?.reminderAt ?? (
    todo?.repeatDaily && todo.repeatReminderTime
      ? new Date(`${todo.date}T${todo.repeatReminderTime}:00+09:00`).toISOString()
      : null
  );
  const [name, setName] = useState<string>('');
  const [reminderOption, setReminderOption] = useState<ReminderOption>('none');
  const [reminderDate, setReminderDate] = useState<string>('');
  const [reminderHour, setReminderHour] = useState<string>('');
  const [reminderMinute, setReminderMinute] = useState<string>('');
  const [reminderMonth, setReminderMonth] = useState<Date>(() => new Date());
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(todo?.title ?? '');
    setReminderOption(existingReminderAt ? 'custom' : 'none');
    const today = toLocalDateTime(new Date().toISOString()).slice(0, 10);
    const savedTime = existingReminderAt ? toLocalDateTime(existingReminderAt) : null;
    const date = savedTime?.slice(0, 10) ?? (selectedDate >= today ? selectedDate : today);
    setReminderDate(date);
    setReminderHour(savedTime?.slice(11, 13) ?? '');
    setReminderMinute(savedTime?.slice(14, 16) ?? '');
    const monthDate = date >= today ? date : today;
    setReminderMonth(new Date(`${monthDate.slice(0, 7)}-01T00:00`));
    setError(null);
  }, [open, todo, existingReminderAt, selectedDate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('할 일 이름을 입력해주세요.');
      return;
    }

    let reminderAt: string | null | undefined;
    const customTime = `${reminderDate}T${reminderHour}:${reminderMinute}`;
    if (canSetReminder) {
      if (reminderOption === 'none') {
        reminderAt = existingReminderAt ? null : undefined;
      } else if (
        reminderOption !== 'custom' ||
        !existingReminderAt ||
        customTime !== toLocalDateTime(existingReminderAt)
      ) {
        const now = Date.now();
        const time = reminderOption === 'custom'
          ? new Date(customTime)
          : new Date(now + Number(reminderOption) * 60_000);
        if (!Number.isFinite(time.getTime()) || time.getTime() <= now) {
          setError('지금보다 나중 시간으로 알림을 설정해주세요.');
          return;
        }
        if (reminderOption === 'custom' && toLocalDateTime(time.toISOString()) !== customTime) {
          setError('이 시간은 선택할 수 없어요. 다른 시간을 골라주세요.');
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
            <option value="10">10분 뒤</option>
            <option value="60">1시간 뒤</option>
            <option value="custom">날짜와 시간 선택</option>
          </select>
          {reminderOption === 'custom' ? (
            <fieldset className="min-w-0 space-y-2">
              <legend className="text-sm font-medium">알림 날짜와 시간</legend>
              <Calendar
                selectedDate={reminderDate}
                onDateSelect={setReminderDate}
                currentMonth={reminderMonth}
                onMonthChange={setReminderMonth}
                minDate={toLocalDateTime(new Date().toISOString()).slice(0, 10)}
              />
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
            {reminderOption === '10' || reminderOption === '60'
              ? '저장한 시점부터 시간을 세고, 아직 완료하지 않았다면 한 번 알려드려요.'
              : '시간을 정해두면 아직 완료하지 않은 할 일을 한 번 알려드려요.'}
          </p>
        </div>
      ) : null}

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </TaskModalLayout>
  );
}
