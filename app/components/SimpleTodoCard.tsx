'use client';

import { Todo, TodoStatus } from '../types/todo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BadgeCheck, Bell, Check, Menu, Pencil, Repeat, Trash2 } from 'lucide-react';
import { getTodayDateString } from '../lib/dateUtils';

interface SimpleTodoCardProps {
  todo: Todo;
  onStatusChange: (id: string, status: TodoStatus) => void;
  onDelete?: (id: string) => void;
  onEdit?: (todo: Todo) => void;
  onEditReminder?: (todo: Todo) => void;
  onRepeatChange?: (todo: Todo, repeatDaily: boolean) => void;
  repeatSaving?: boolean;
  featured?: boolean;
}

export default function SimpleTodoCard({
  todo,
  onStatusChange,
  onDelete,
  onEdit,
  onEditReminder,
  onRepeatChange,
  repeatSaving = false,
  featured = false,
}: SimpleTodoCardProps) {
  const isDone = todo.status === TodoStatus.DONE;
  const today = getTodayDateString();
  const isPastDate = todo.date < today;
  const isFutureDate = todo.date > today;
  const isCompletionLocked = isPastDate || isFutureDate;
  const canRepeat = !isPastDate && Boolean(onRepeatChange);
  const canEdit = !isPastDate && Boolean(onEdit);
  const canEditReminder = !isPastDate && !isDone && Boolean(onEditReminder);
  const hasEditableActions = canEdit || canEditReminder || canRepeat;
  const completionLockReason = isPastDate
    ? '마감된 할 일은 상태를 변경할 수 없어요.'
    : '예정된 할 일은 해당 날짜에 완료할 수 있어요.';

  return (
    <article
      className={`@container/todo companion-entry group relative min-w-0 ${
        isDone
          ? 'border-primary/20 bg-secondary/45'
          : featured
            ? 'border-primary/35 bg-secondary/35'
            : ''
      }`}
    >
      <div data-workspace-part="todo-row" className="flex flex-col gap-3 @min-[30rem]/todo:flex-row @min-[30rem]/todo:items-center">
        <div className="flex min-w-0 items-start gap-3 @min-[30rem]/todo:flex-1 @min-[30rem]/todo:items-center">
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
            {isDone ? (
              <>
                <Check
                  aria-hidden="true"
                  className="size-4 text-white in-data-[today-theme=night]:hidden"
                />
                <BadgeCheck
                  aria-hidden="true"
                  className="hidden size-5 text-primary-foreground in-data-[today-theme=night]:block"
                />
              </>
            ) : null}
          </Button>

          {/* 제목 */}
          <div className="min-w-0 flex-1">
            <h3
              className={`break-words text-base font-medium leading-6 text-foreground [overflow-wrap:anywhere] ${isDone ? 'line-through opacity-60 in-data-[today-theme=night]:text-muted-foreground in-data-[today-theme=night]:opacity-100' : ''}`}
            >
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
            <div className="empty:hidden mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {!isPastDate && todo.repeatDaily ? (
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  <Repeat aria-hidden="true" className="size-3 shrink-0" />
                  매일 반복
                </span>
              ) : null}
              {!isPastDate && todo.repeatDaily && todo.repeatReminderTime ? (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Bell aria-hidden="true" className="size-3 shrink-0" />
                  매일 {todo.repeatReminderTime} 알림
                </span>
              ) : !isDone && todo.reminderAt ? (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Bell aria-hidden="true" className="size-3 shrink-0" />
                  <time dateTime={todo.reminderAt}>
                    {new Date(todo.reminderAt).toLocaleString('ko-KR', {
                      timeZone: 'Asia/Seoul',
                      month: 'numeric',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })} 알림
                  </time>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div data-workspace-part="todo-actions" className="flex min-w-0 flex-wrap items-center justify-end gap-1 border-t border-border/60 pt-2 @min-[30rem]/todo:border-t-0 @min-[30rem]/todo:pt-0">
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
              className={`min-h-11 rounded-xl border px-4 text-xs font-semibold transition-colors ${
                todo.status === TodoStatus.IN_PROGRESS
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:bg-secondary'
              } disabled:cursor-not-allowed disabled:opacity-45`}
              title={isPastDate ? '마감된 할 일은 상태를 변경할 수 없어요.' : undefined}
            >
              {todo.status === TodoStatus.IN_PROGRESS ? '진행 중' : '시작'}
            </button>
          ) : null}
          {hasEditableActions || onDelete ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-11 rounded-xl text-muted-foreground hover:text-foreground"
                  aria-label={`${todo.title} 옵션`}
                  aria-busy={repeatSaving || undefined}
                >
                  <Menu aria-hidden="true" className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-40 rounded-xl p-1.5">
                {canEdit ? (
                  <DropdownMenuItem className="min-h-11 cursor-pointer rounded-lg" disabled={repeatSaving} onSelect={() => onEdit?.(todo)}>
                    <Pencil aria-hidden="true" /> 수정하기
                  </DropdownMenuItem>
                ) : null}
                {canEditReminder ? (
                  <DropdownMenuItem className="min-h-11 cursor-pointer rounded-lg" disabled={repeatSaving} onSelect={() => onEditReminder?.(todo)}>
                    <Bell aria-hidden="true" /> 알림 설정
                  </DropdownMenuItem>
                ) : null}
                {canRepeat ? (
                  <DropdownMenuCheckboxItem
                    checked={todo.repeatDaily === true}
                    disabled={repeatSaving}
                    className="min-h-11 cursor-pointer rounded-lg"
                    onCheckedChange={(checked) => onRepeatChange?.(todo, checked)}
                  >
                    <Repeat aria-hidden="true" /> 매일 반복
                  </DropdownMenuCheckboxItem>
                ) : null}
                {onDelete ? (
                  <>
                    {hasEditableActions ? <DropdownMenuSeparator /> : null}
                    <DropdownMenuItem
                      variant="destructive"
                      className="min-h-11 cursor-pointer rounded-lg"
                      disabled={repeatSaving}
                      onSelect={() => onDelete(todo.id)}
                    >
                      <Trash2 aria-hidden="true" /> 삭제하기
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </article>
  );
}
