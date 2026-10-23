'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EditableNumberInput from '@/app/components/EditableNumberInput';
import TaskModalLayout from '../TaskModalLayout';
import ReminderTimeFields from '../ReminderTimeFields';
import type { Habit } from '@/app/types/todo';

export interface CreateHabitInput {
  name: string;
  dailyTarget: number;
  reminderTime?: string | null;
  reminderDays?: number[];
}

enum ReminderRepeat {
  NONE = 'none',
  DAILY = 'daily',
  WEEKDAYS = 'weekdays',
  CUSTOM = 'custom',
}

const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];
const DAY_OPTIONS = [
  { value: 1, label: '월' }, { value: 2, label: '화' },
  { value: 3, label: '수' }, { value: 4, label: '목' },
  { value: 5, label: '금' }, { value: 6, label: '토' },
  { value: 0, label: '일' },
];

function sameDays(first: number[], second: number[]): boolean {
  return first.length === second.length && first.every((day) => second.includes(day));
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
  const [name, setName] = useState<string>('');
  const [dailyTarget, setDailyTarget] = useState<number>(5);
  const [repeat, setRepeat] = useState<ReminderRepeat>(ReminderRepeat.NONE);
  const [days, setDays] = useState<number[]>(EVERY_DAY);
  const [hour, setHour] = useState<string>('09');
  const [minute, setMinute] = useState<string>('00');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(habit?.title ?? '');
    setDailyTarget(habit?.dailyTarget ?? 5);
    const savedDays = habit?.reminderDays ?? [];
    setRepeat(!habit?.reminderTime ? ReminderRepeat.NONE
      : sameDays(savedDays, EVERY_DAY) ? ReminderRepeat.DAILY
      : sameDays(savedDays, WEEKDAYS) ? ReminderRepeat.WEEKDAYS
      : ReminderRepeat.CUSTOM);
    setDays(savedDays.length ? savedDays : EVERY_DAY);
    setHour(habit?.reminderTime?.slice(0, 2) ?? '09');
    setMinute(habit?.reminderTime?.slice(3, 5) ?? '00');
    setError(null);
  }, [open, habit]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('습관 이름을 입력해주세요.');
      return;
    }

    const reminderTime = repeat === ReminderRepeat.NONE ? null : `${hour}:${minute}`;
    const reminderDays = repeat === ReminderRepeat.NONE ? []
      : repeat === ReminderRepeat.DAILY ? EVERY_DAY
      : repeat === ReminderRepeat.WEEKDAYS ? WEEKDAYS : days;
    if (reminderTime && reminderDays.length === 0) {
      setError('알림을 받을 요일을 하나 이상 골라주세요.');
      return;
    }
    const reminderChanged = reminderTime !== (habit?.reminderTime ?? null)
      || !sameDays(reminderDays, habit?.reminderDays ?? []);

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: trimmedName,
        dailyTarget,
        ...(reminderChanged ? { reminderTime, reminderDays: [...reminderDays].sort() } : {}),
      });
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
        />
      </div>

      <div>
        <Label htmlFor="habit-daily-target" className="mb-2 text-sm font-medium">
          하루 목표 횟수
        </Label>
        <EditableNumberInput
          id="habit-daily-target"
          min={1}
          max={50}
          value={dailyTarget}
          onValueChange={setDailyTarget}
        />
        <p className="mt-1 text-xs text-muted-foreground">하루에 몇 번 실천할지 정해주세요.</p>
      </div>

      <div className="min-w-0 space-y-3">
        <Label htmlFor="habit-reminder-repeat">습관 알림</Label>
        <select
          id="habit-reminder-repeat"
          value={repeat}
          onChange={(event) => {
            const value = event.target.value as ReminderRepeat;
            setRepeat(value);
            if (value === ReminderRepeat.DAILY) setDays(EVERY_DAY);
            if (value === ReminderRepeat.WEEKDAYS) setDays(WEEKDAYS);
          }}
          aria-describedby="habit-reminder-help"
          className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
        >
          <option value={ReminderRepeat.NONE}>알림 없음</option>
          <option value={ReminderRepeat.DAILY}>매일</option>
          <option value={ReminderRepeat.WEEKDAYS}>평일 · 월~금</option>
          <option value={ReminderRepeat.CUSTOM}>요일 직접 선택</option>
        </select>
        {repeat === ReminderRepeat.CUSTOM ? (
          <fieldset className="min-w-0 space-y-2">
            <legend className="text-sm font-medium">반복 요일</legend>
            <div className="grid grid-cols-7 gap-1">
              {DAY_OPTIONS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  aria-label={`${day.label}요일`}
                  aria-pressed={days.includes(day.value)}
                  onClick={() => setDays((previous) => previous.includes(day.value)
                    ? previous.filter((value) => value !== day.value) : [...previous, day.value])}
                  className={`min-h-11 rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${days.includes(day.value)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-secondary'}`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}
        {repeat !== ReminderRepeat.NONE ? (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">알림 시간 · 한국 시간</legend>
            <ReminderTimeFields
              id="habit-reminder"
              hour={hour}
              minute={minute}
              onHourChange={setHour}
              onMinuteChange={setMinute}
            />
          </fieldset>
        ) : null}
        <p id="habit-reminder-help" className="text-xs text-muted-foreground">
          선택한 요일에 하루 한 번 알려드려요. 그날 목표 횟수를 이미 채웠다면 쉬어갈게요.
        </p>
      </div>

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </TaskModalLayout>
  );
}
