'use client';

import { Todo, TodoStatus } from '../types/todo';
import { Button } from '@/components/ui/button';
import { Check, Trash2 } from 'lucide-react';
import { getTodayDateString } from '../lib/dateUtils';

interface SimpleTodoCardProps {
  todo: Todo;
  onStatusChange: (id: string, status: TodoStatus) => void;
  onDelete?: (id: string) => void;
  featured?: boolean;
}

export default function SimpleTodoCard({
  todo,
  onStatusChange,
  onDelete,
  featured = false,
}: SimpleTodoCardProps) {
  const isDone = todo.status === TodoStatus.DONE;
  const today = getTodayDateString();
  const isPastDate = todo.date < today;
  const isFutureDate = todo.date > today;
  const isCompletionLocked = isPastDate || isFutureDate;
  const completionLockReason = isPastDate
    ? '마감된 할 일은 상태를 변경할 수 없어요.'
    : '예정된 할 일은 해당 날짜에 완료할 수 있어요.';

  return (
    <article
      className={`companion-entry group relative ${
        isDone
          ? 'border-primary/20 bg-secondary/45'
          : featured
            ? 'border-primary/35 bg-secondary/35'
            : ''
      }`}
    >
      <div className="flex items-center gap-3">
        {/* 체크박스 */}
        <Button
          onClick={() => {
            if (todo.status === TodoStatus.DONE) {
              onStatusChange(todo.id, TodoStatus.TODO);
            } else {
              onStatusChange(todo.id, TodoStatus.DONE);
            }
          }}
          disabled={isCompletionLocked}
          variant="ghost"
          size="sm"
          className={`
            h-11 w-11 flex-shrink-0 rounded-[14px] border-2 p-0 transition-transform active:scale-95
            ${
              isDone
                ? 'bg-primary border-primary hover:bg-primary/90'
                : 'border-stone-300 dark:border-stone-600 hover:border-primary dark:hover:border-primary'
            }
            disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-stone-300
          `}
          aria-label={
            isCompletionLocked
              ? `${todo.title}: ${completionLockReason}`
              : `${todo.title} 완료 상태 변경`
          }
          title={isCompletionLocked ? completionLockReason : undefined}
        >
          {isDone ? <Check className="h-4 w-4 text-white" /> : null}
        </Button>

        {/* 제목 */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-foreground ${isDone ? 'line-through opacity-60' : ''}`}>
            {todo.title}
          </h3>
          {isPastDate && !isDone ? (
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              기한이 지나 완료할 수 없어요
            </p>
          ) : isFutureDate && !isDone ? (
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              예정된 날짜에 완료할 수 있어요
            </p>
          ) : featured && !isDone ? (
            <p className="mt-1 text-xs font-semibold text-primary">오늘의 우선순위</p>
          ) : null}
        </div>

        {/* 진행 중 버튼 */}
        {!isDone ? (
          <button
              type="button"
            onClick={() => {
              const newStatus =
                todo.status === TodoStatus.IN_PROGRESS ? TodoStatus.TODO : TodoStatus.IN_PROGRESS;
              onStatusChange(todo.id, newStatus);
              }}
              disabled={isPastDate}
              className={`min-h-11 rounded-xl border px-3 text-xs font-semibold transition-colors ${
              todo.status === TodoStatus.IN_PROGRESS
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:bg-secondary'
              } disabled:cursor-not-allowed disabled:opacity-45`}
              title={isPastDate ? '마감된 할 일은 상태를 변경할 수 없어요.' : undefined}
            >
              {todo.status === TodoStatus.IN_PROGRESS ? '진행 중' : '시작'}
          </button>
        ) : null}
        {onDelete && (
          <Button
            onClick={() => onDelete(todo.id)}
            variant="ghost"
            size="sm"
            className="h-11 w-11 flex-shrink-0 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label={`${todo.title} 삭제`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </article>
  );
}
