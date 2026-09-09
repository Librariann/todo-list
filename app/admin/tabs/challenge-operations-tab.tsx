'use client';

import { useState } from 'react';
import ChallengeRotationOperations from './challenge-rotation-operations';
import { RecurrenceType } from './types';

const periods: Array<{
  value: RecurrenceType;
  label: string;
  description: string;
}> = [
  { value: 'DAILY', label: '일일', description: '매일 바뀌는 조합' },
  { value: 'WEEKLY', label: '주간', description: '주 단위 조합' },
  { value: 'MONTHLY', label: '월간', description: '월 단위 조합' },
];

export default function ChallengeOperationsTab() {
  const [periodType, setPeriodType] = useState<RecurrenceType>('DAILY');

  return (
    <div className="space-y-6">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold tracking-wide text-primary">도전과제 순환 운영</p>
        <h2 className="friendly-heading mt-1 text-2xl font-bold text-foreground">
          현재 노출을 확인하고 조정해요
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          수동 재선발과 최근 실행 기록을 한곳에서 확인할 수 있어요. 미리보기만으로는 사용자
          화면이 바뀌지 않습니다.
        </p>
      </header>

      <div
        className="grid border-b border-stone-200 dark:border-white/[0.08] sm:w-fit sm:min-w-[30rem] sm:grid-cols-3"
        role="tablist"
        aria-label="도전과제 운영 주기"
      >
        {periods.map((period) => {
          const isSelected = periodType === period.value;

          return (
            <button
              key={period.value}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setPeriodType(period.value)}
              className={`relative min-h-14 px-4 pb-3 pt-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isSelected ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="block text-sm font-bold">{period.label}</span>
              <span className="mt-0.5 hidden text-[11px] font-medium opacity-70 sm:block">
                {period.description}
              </span>
              {isSelected ? (
                <span className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-primary" />
              ) : null}
            </button>
          );
        })}
      </div>

      <ChallengeRotationOperations periodType={periodType} onRerolled={() => undefined} />
    </div>
  );
}
