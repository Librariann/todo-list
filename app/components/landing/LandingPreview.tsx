'use client';

import { useState } from 'react';
import { Check, Plus, RotateCcw } from 'lucide-react';

type PreviewTab = 'habits' | 'todos' | 'goals';
interface PreviewItem {
  id: string;
  title: string;
  detail: string;
  target: number;
}
const examples: Record<PreviewTab, PreviewItem[]> = {
  habits: [
    { id: 'water', title: '물 한 잔 마시기', detail: '작게, 자주 실천해요', target: 3 },
    { id: 'stretch', title: '잠들기 전 스트레칭', detail: '하루 한 번, 나를 위해', target: 1 },
  ],
  todos: [
    { id: 'desk', title: '책상 위 정리하기', detail: '오늘 끝내고 싶은 일', target: 1 },
    { id: 'message', title: '미뤄둔 연락 보내기', detail: '작은 일도 하나씩', target: 1 },
  ],
  goals: [
    { id: 'book', title: '이번 주 책 한 권 읽기', detail: '매주 이어가는 목표', target: 1 },
    { id: 'walk', title: '이번 달 새로운 길 걷기', detail: '내 속도에 맞춘 목표', target: 1 },
  ],
};
const tabs: Array<{ key: PreviewTab; label: string }> = [
  { key: 'habits', label: '습관' },
  { key: 'todos', label: '할 일' },
  { key: 'goals', label: '목표' },
];

export default function LandingPreview() {
  const [tab, setTab] = useState<PreviewTab>('habits');
  const [counts, setCounts] = useState<Record<string, number>>({ water: 1 });
  const [message, setMessage] = useState<string>('오른쪽 버튼을 눌러 하나씩 완료해 보세요.');
  const items = examples[tab];
  const completed = items.filter((item) => (counts[item.id] ?? 0) >= item.target).length;

  const handleProgress = (item: PreviewItem): void => {
    const current = counts[item.id] ?? 0;
    const next = current >= item.target ? 0 : current + 1;
    setCounts((previous) => ({ ...previous, [item.id]: next }));
    setMessage(
      next >= item.target
        ? `${item.title}, 해냈어요!`
        : next === 0
          ? `${item.title} 기록을 되돌렸어요.`
          : `${item.title}, ${next}번 실천했어요.`
    );
  };

  return (
    <div className="min-w-0 rounded-[1.75rem] border border-border bg-card p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between gap-3 border-b border-border pb-4">
        <p className="text-sm font-bold text-primary">오늘의 작은 실천</p>
        <span className="text-xs text-muted-foreground">미리 체험하기</span>
      </div>
      <div
        className="grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1"
        aria-label="체험할 기능 선택"
      >
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={tab === item.key}
            aria-controls="preview-items"
            onClick={() => {
              setTab(item.key);
              setMessage('오른쪽 버튼을 눌러 하나씩 완료해 보세요.');
            }}
            className={`min-h-11 rounded-xl text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${tab === item.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-6 flex items-baseline justify-between gap-3">
        <h3 className="friendly-heading text-2xl font-bold">
          {tab === 'habits' ? '오늘의 습관' : tab === 'todos' ? '오늘의 할 일' : '나의 목표'}
        </h3>
        <p className="shrink-0 text-sm font-semibold text-primary tabular-nums">
          {completed} / {items.length} 완료
        </p>
      </div>
      <ul id="preview-items" className="mt-4 space-y-3">
        {items.map((item) => {
          const count = counts[item.id] ?? 0;
          const done = count >= item.target;
          return (
            <li
              key={item.id}
              className={`rounded-2xl border p-4 transition-colors ${done ? 'border-primary/30 bg-secondary' : 'border-border bg-background'}`}
            >
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p
                    className={`break-keep text-base font-bold leading-6 ${done ? 'text-primary' : 'text-foreground'}`}
                  >
                    {item.title}
                  </p>
                  <p className="mt-1 break-keep text-xs leading-5 text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleProgress(item)}
                  aria-label={`${item.title} ${done ? '완료 취소' : tab === 'habits' ? '실천 기록' : '완료'}`}
                  className={`flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${done ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90' : 'border-primary/30 text-primary hover:bg-secondary'}`}
                >
                  {done ? (
                    <Check className="size-5" aria-hidden="true" />
                  ) : tab === 'habits' ? (
                    <Plus className="size-5" aria-hidden="true" />
                  ) : (
                    <span aria-hidden="true" className="size-4 rounded border border-current" />
                  )}
                </button>
              </div>
              {tab === 'habits' ? (
                <div className="mt-3 flex items-center gap-3">
                  <progress
                    aria-label={`${item.title} 진행도`}
                    value={count}
                    max={item.target}
                    className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full accent-primary"
                  />
                  <span className="text-xs font-semibold text-primary tabular-nums">
                    {count}/{item.target}
                  </span>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p
        role="status"
        aria-live="polite"
        className="mt-4 min-h-10 break-keep text-sm leading-5 text-primary"
      >
        {message}
      </p>
      <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
        <span>체험용 예시이며 저장되지 않아요.</span>
        <button
          type="button"
          onClick={() => {
            setCounts({ water: 1 });
            setMessage('처음부터 다시 해볼까요?');
          }}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="체험 기록 초기화"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          처음으로
        </button>
      </div>
    </div>
  );
}
