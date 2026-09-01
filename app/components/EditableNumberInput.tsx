'use client';

import { useEffect, useState, type FocusEvent, type InputHTMLAttributes } from 'react';
import { Input } from '@/components/ui/input';

interface EditableNumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'onChange' | 'type' | 'value'> {
  value: number;
  onValueChange: (value: number) => void;
}

function toFiniteNumber(value: string | number | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function EditableNumberInput({
  value,
  min,
  max,
  step = 1,
  onValueChange,
  onFocus,
  onBlur,
  ...props
}: EditableNumberInputProps) {
  const [draft, setDraft] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);
  const minimum = toFiniteNumber(min, Number.NEGATIVE_INFINITY);
  const maximum = toFiniteNumber(max, Number.POSITIVE_INFINITY);

  useEffect(() => {
    if (!isFocused) setDraft(String(value));
  }, [isFocused, value]);

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);

    const parsed = Number(draft);
    const normalized =
      draft === '' || !Number.isFinite(parsed)
        ? Math.min(maximum, Math.max(minimum, value))
        : Math.min(maximum, Math.max(minimum, parsed));

    setDraft(String(normalized));
    if (normalized !== value) onValueChange(normalized);
    onBlur?.(event);
  };

  return (
    <Input
      {...props}
      type="number"
      min={min}
      max={max}
      step={step}
      value={draft}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={(event) => {
        const nextDraft = event.currentTarget.value;
        setDraft(nextDraft);
        if (nextDraft === '') return;

        const parsed = Number(nextDraft);
        if (Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum) {
          onValueChange(parsed);
        }
      }}
    />
  );
}
