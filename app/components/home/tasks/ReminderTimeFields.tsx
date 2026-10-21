'use client';

import { Label } from '@/components/ui/label';

const hours = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, '0'));
const selectClassName =
  'min-h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm';

interface ReminderTimeFieldsProps {
  id: string;
  hour: string;
  minute: string;
  onHourChange: (hour: string) => void;
  onMinuteChange: (minute: string) => void;
}

export default function ReminderTimeFields({
  id, hour, minute, onHourChange, onMinuteChange,
}: ReminderTimeFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="min-w-0 space-y-1">
        <Label htmlFor={`${id}-hour`}>시</Label>
        <select
          id={`${id}-hour`}
          value={hour}
          onChange={(event) => onHourChange(event.target.value)}
          required
          className={selectClassName}
        >
          <option value="" disabled>시 선택</option>
          {hours.map((value) => <option key={value} value={value}>{value}시</option>)}
        </select>
      </div>
      <div className="min-w-0 space-y-1">
        <Label htmlFor={`${id}-minute`}>분</Label>
        <select
          id={`${id}-minute`}
          value={minute}
          onChange={(event) => onMinuteChange(event.target.value)}
          required
          className={selectClassName}
        >
          <option value="" disabled>분 선택</option>
          {minutes.map((value) => <option key={value} value={value}>{value}분</option>)}
        </select>
      </div>
    </div>
  );
}
