'use client';

import { useEffect, useRef, useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowUp, GripVertical, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { Reward } from './types';
import { apiFetch } from '@/app/lib/apiClient';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button } from '@/components/ui/button';

interface RewardOrderEditorProps {
  rewards: Reward[];
  onSaved: (rewards: Reward[]) => void;
  onCancel: () => void;
  onReload: () => void;
}

interface SortableRewardProps {
  reward: Reward;
  index: number;
  count: number;
  disabled: boolean;
  onMove: (from: number, to: number) => void;
}

function SortableReward({ reward, index, count, disabled, onMove }: SortableRewardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: reward.id, disabled });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative flex min-w-0 items-center gap-2 rounded-xl border border-border bg-card px-2 py-3 motion-reduce:!transition-none sm:gap-3 sm:px-4 ${isDragging ? 'opacity-30' : ''}`}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        disabled={disabled}
        aria-label={`${reward.name} 순서 이동`}
        aria-roledescription="드래그 손잡이"
        className="flex size-11 shrink-0 touch-none select-none items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 enabled:cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="size-5" aria-hidden="true" />
      </button>
      <span
        className="w-5 shrink-0 text-center text-sm font-semibold tabular-nums text-primary"
        aria-label={`${index + 1}번째`}
      >
        {index + 1}
      </span>
      <div
        aria-hidden="true"
        className="hidden size-12 shrink-0 items-center justify-center rounded-lg bg-muted bg-contain bg-center bg-no-repeat text-muted-foreground sm:flex"
        style={
          reward.imageUrl
            ? { backgroundImage: `url("${reward.imageUrl.replaceAll('"', '\\"')}")` }
            : undefined
        }
      >
        {!reward.imageUrl && <PackageCheck className="size-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-semibold [overflow-wrap:anywhere]">{reward.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {reward.point.toLocaleString()} P · {reward.exchangeEnabled ? '교환 열림' : '교환 닫힘'}
        </p>
      </div>
      <div className="flex shrink-0 flex-col sm:flex-row">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label={`${reward.name} 위로 이동`}
          disabled={disabled || index === 0}
          onClick={() => onMove(index, index - 1)}
        >
          <ArrowUp className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label={`${reward.name} 아래로 이동`}
          disabled={disabled || index === count - 1}
          onClick={() => onMove(index, index + 1)}
        >
          <ArrowDown className="size-4" />
        </Button>
      </div>
    </li>
  );
}

export default function RewardOrderEditor({
  rewards,
  onSaved,
  onCancel,
  onReload,
}: RewardOrderEditorProps) {
  const [items, setItems] = useState<Reward[]>(() => [...rewards]);
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [stale, setStale] = useState<boolean>(false);
  const [confirmCancel, setConfirmCancel] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<string>('');
  const savingRef = useRef<boolean>(false);
  const dirty = items.some((item, index) => item.id !== rewards[index]?.id);
  const activeReward = items.find((item) => item.id === activeId);
  const disabled = saving || stale;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function move(from: number, to: number): void {
    if (disabled || from < 0 || to < 0 || to >= items.length || from === to) return;
    setItems((current) => arrayMove(current, from, to));
    setAnnouncement(
      `${items[from].name}, ${to + 1}번째로 이동했어요. 순서 저장을 눌러 적용하세요.`
    );
    setError('');
  }

  function handleDragEnd({ active, over }: DragEndEvent): void {
    setActiveId(null);
    if (!over) return;
    move(
      items.findIndex((item) => item.id === active.id),
      items.findIndex((item) => item.id === over.id)
    );
  }

  async function handleSave(): Promise<void> {
    if (savingRef.current || !dirty || stale) return;
    savingRef.current = true;
    setSaving(true);
    setError('');
    try {
      const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rewards/order`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardIds: items.map((item) => Number(item.id)) }),
      });
      const body = await response.json().catch(() => null);
      if (response.status === 409) {
        setStale(true);
        throw new Error('보상 목록이 변경되었어요. 최신 목록을 불러온 뒤 순서를 다시 정해 주세요.');
      }
      if (!response.ok || !Array.isArray(body?.data)) {
        throw new Error(
          typeof body?.message === 'string'
            ? body.message
            : '순서를 저장하지 못했어요. 다시 시도해 주세요.'
        );
      }
      toast.success('보상 표시 순서를 저장했어요.');
      onSaved(body.data as Reward[]);
    } catch (error) {
      setError(
        error instanceof TypeError
          ? '연결이 원활하지 않아요. 조정한 순서는 유지돼요. 다시 저장해 주세요.'
          : error instanceof Error
            ? error.message
            : '순서를 저장하지 못했어요.'
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <section aria-label="보상 순서 조정" className="space-y-4">
      <div className="rounded-2xl bg-primary/5 px-5 py-4">
        <h3 className="text-base font-bold">보상이 보이는 순서를 정해요</h3>
        <p id="reward-order-help" className="mt-2 text-sm leading-6 text-muted-foreground">
          왼쪽 손잡이를 끌거나 화살표로 이동하세요.
          <br />
          위쪽 보상부터 사용자 화면에 표시돼요. 변경 후 순서 저장을 눌러 주세요.
        </p>
      </div>
      <DndContext
        id="reward-order"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
        accessibility={{
          screenReaderInstructions: {
            draggable:
              '스페이스 또는 엔터로 보상을 선택하세요. 위아래 방향키로 이동하고 스페이스 또는 엔터로 내려놓으세요. Esc는 이동을 취소합니다.',
          },
          announcements: {
            onDragStart: ({ active }) =>
              `${items.find((item) => item.id === active.id)?.name ?? '보상'}을 선택했어요.`,
            onDragOver: ({ over }) =>
              over
                ? `${items.findIndex((item) => item.id === over.id) + 1}번째 위치예요.`
                : '목록 안으로 이동하세요.',
            onDragEnd: ({ over }) =>
              over ? '이동을 마쳤어요. 순서 저장을 눌러 적용하세요.' : '이동을 취소했어요.',
            onDragCancel: () => '이동을 취소했어요.',
          },
        }}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <ol aria-describedby="reward-order-help" className="space-y-2">
            {items.map((reward, index) => (
              <SortableReward
                key={reward.id}
                reward={reward}
                index={index}
                count={items.length}
                disabled={disabled}
                onMove={move}
              />
            ))}
          </ol>
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {activeReward && (
            <div className="flex items-center gap-3 rounded-xl border border-primary bg-card px-5 py-5 text-sm font-bold text-foreground shadow-lg">
              <GripVertical className="size-5 shrink-0 text-primary" />
              <span className="truncate">{activeReward.name}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
      <p role="status" className="sr-only">
        {announcement}
      </p>
      {error && (
        <div role="alert" className="rounded-xl border border-destructive/25 p-4">
          <p className="text-sm text-destructive">{error}</p>
          {stale && (
            <Button type="button" variant="outline" className="mt-3 min-h-11" onClick={onReload}>
              최신 목록 다시 불러오기
            </Button>
          )}
        </div>
      )}
      <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">
          {dirty ? '아직 저장하지 않은 순서예요.' : '순서를 조정하면 저장할 수 있어요.'}
        </p>
        <div className="ml-auto flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={saving || activeId !== null}
            onClick={() => (dirty ? setConfirmCancel(true) : onCancel())}
          >
            취소
          </Button>
          <Button
            type="button"
            className="min-h-11"
            disabled={!dirty || disabled || activeId !== null}
            onClick={() => void handleSave()}
          >
            {saving ? '저장 중…' : '순서 저장'}
          </Button>
        </div>
      </div>
      <ConfirmModal
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="순서 변경을 취소할까요?"
        description="저장하지 않은 순서 변경은 사라지고, 기존 순서가 유지돼요."
        warning=""
        confirmLabel="변경 취소"
        cancelLabel="계속 조정하기"
        onConfirm={onCancel}
      />
    </section>
  );
}
