'use client';

import SimpleTodoCard from '@/app/components/SimpleTodoCard';
import { Todo, TodoStatus } from '@/app/types/todo';
import {
  TaskEmptyState,
  TaskErrorState,
  TaskLoadingState,
  TaskSectionHeader,
} from '../TaskSectionLayout';
import { useEffect, useState } from 'react';
import { formatDate, getTodayDateString } from '@/app/lib/dateUtils';
import { createTodo, deleteTodo, updateTodo, updateTodoStatus } from '@/app/lib/todosApi';
import { useCalendarStore } from '@/app/store/calendarStore';
import { useUserSummaryStore } from '@/app/store/userSummaryStore';
import { useAuthStore } from '@/app/store/authStore';
import { toast } from 'sonner';
import TodoFormModal, { type TodoForm, type TodoFormInput } from './TodoFormModal';
import ConfirmModal from '@/app/components/ConfirmModal';
import { useTodosStore } from '@/app/store/todosStore';
import { getAwardedPoints, notifyChallengeAchievements } from '@/app/lib/challengeNotifications';

const EMPTY_TODOS: Todo[] = [];

interface TodoSectionProps {
  createRequestKey?: number;
}

export default function TodoSection({ createRequestKey }: TodoSectionProps) {
  const isAuthenticated = useAuthStore((auth) => auth.isAuthenticated);
  const [form, setForm] = useState<TodoForm | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Todo | null>(null);
  const [savingRepeatIds, setSavingRepeatIds] = useState<string[]>([]);
  const selectedDate = useCalendarStore((calendar) => calendar.selectedDate);
  const invalidateCalendarMarks = useCalendarStore((calendar) => calendar.invalidateMarks);
  const todos = useTodosStore((state) => state.todosByDate[selectedDate] ?? EMPTY_TODOS);
  const loading = useTodosStore((state) => state.loadingByDate[selectedDate] ?? false);
  const loadError = useTodosStore((state) => state.errorsByDate[selectedDate] ?? null);
  const fetchTodos = useTodosStore((state) => state.fetchTodos);
  const setTodosForDate = useTodosStore((state) => state.setTodos);
  const refreshSummary = useUserSummaryStore((summary) => summary.refreshSummary);
  const adjustPoints = useUserSummaryStore((summary) => summary.adjustPoints);
  const dateLabel = formatDate(selectedDate);
  const today = getTodayDateString();
  const isPastDate = selectedDate < today;
  const isToday = selectedDate === today;
  const canCreate = !isPastDate;
  const emptyState = isPastDate
    ? {
        title: '이날 등록한 할 일이 없어요.',
        description: '남겨둔 할 일이 없어 확인할 기록이 없어요.',
      }
    : isToday
      ? {
          title: '오늘 할 일이 아직 없어요.',
          description: '지금 끝내고 싶은 일을 한 줄로 적어보세요.',
        }
      : {
          title: '이날 할 일이 아직 없어요.',
          description: '미리 해둘 일을 적어두고 편하게 준비해보세요.',
        };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void fetchTodos(selectedDate);
  }, [fetchTodos, isAuthenticated, selectedDate]);

  useEffect(() => {
    if (createRequestKey === undefined || !canCreate) return;
    setForm({ mode: 'create' });
  }, [canCreate, createRequestKey]);

  const handleSubmitTodo = async (input: TodoFormInput) => {
    if (input.mode === 'create') {
      const created = await createTodo(input.name, selectedDate, input.reminderAt);
      setTodosForDate(selectedDate, (previousTodos) => [created, ...previousTodos]);
      invalidateCalendarMarks();
      toast.success('할 일을 추가했어요.');
      return;
    }

    if (!form || form.mode !== input.mode) return;
    const target = form.todo;
    const updated = await updateTodo(target.id, input.mode === 'edit'
      ? { name: input.name }
      : { reminderAt: input.reminderAt });
    setTodosForDate(target.date, (previousTodos) =>
      previousTodos.map((todo) => (todo.id === updated.id ? updated : todo))
    );
    toast.success(input.mode === 'edit' ? '할 일을 수정했어요.'
      : input.reminderAt ? '알림 시간을 저장했어요.' : '알림을 껐어요.');
  };

  const handleRepeatChange = async (todo: Todo, repeatDaily: boolean) => {
    if (todo.date < getTodayDateString() || savingRepeatIds.includes(todo.id)) return;

    setSavingRepeatIds((ids) => [...ids, todo.id]);
    setTodosForDate(todo.date, (items) => items.map((item) => (
      item.id === todo.id ? { ...item, repeatDaily } : item
    )));

    try {
      const updated = await updateTodo(todo.id, { repeatDaily });
      if (updated.repeatDaily !== repeatDaily) {
        throw new Error('반복 설정을 저장하지 못했어요. 잠시 후 다시 시도해주세요.');
      }
      setTodosForDate(todo.date, (items) => items.map((item) => (
        item.id === todo.id ? { ...item, repeatDaily, repeatReminderTime: updated.repeatReminderTime } : item
      )));
      toast.success(repeatDaily ? '매일 반복을 켰어요.' : '매일 반복을 껐어요.');
    } catch (error) {
      setTodosForDate(todo.date, (items) => items.map((item) => (
        item.id === todo.id ? { ...item, repeatDaily: todo.repeatDaily } : item
      )));
      toast.error(error instanceof Error ? error.message : '반복 설정을 저장하지 못했어요.');
    } finally {
      setSavingRepeatIds((ids) => ids.filter((id) => id !== todo.id));
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    const snapshot = todos;
    const afterDelete = todos.filter((t) => t.id !== todoId);
    setTodosForDate(selectedDate, afterDelete);

    try {
      await deleteTodo(todoId);
      invalidateCalendarMarks();
      if (snapshot.some((todo) => todo.id === todoId && todo.status === TodoStatus.DONE)) {
        await refreshSummary();
      }
      toast.success('할 일을 삭제했어요.');
    } catch (error) {
      setTodosForDate(selectedDate, snapshot);
      throw error;
    }
  };

  const handleTodoStatusChange = async (todoId: string, newStatus: TodoStatus) => {
    const target = todos.find((todo) => todo.id === todoId);

    if (!target || target.date < today || (target.date > today && newStatus === TodoStatus.DONE)) {
      return;
    }

    setTodosForDate(target.date, (items) => items.map((item) => {
      if (item.id !== todoId) {
        return item;
      }

      return newStatus === TodoStatus.DONE
        ? { ...item, status: newStatus, completedAt: new Date(), reminderAt: null }
        : { ...item, status: newStatus, completedAt: undefined };
    }));

    try {
      const result = await updateTodoStatus(todoId, newStatus);
      adjustPoints(getAwardedPoints(result.achievements));
      notifyChallengeAchievements(result.achievements);
    } catch {
      setTodosForDate(target.date, (items) => items.map((item) => (
        item.id === todoId && item.status === newStatus
          ? { ...item, status: target.status, completedAt: target.completedAt, reminderAt: target.reminderAt }
          : item
      )));
      return;
    }

    try {
      await refreshSummary();
    } catch (error) {
      console.error('할 일 변경 후 진행 상황 동기화 실패:', error);
    }
  };
  return (
    <>
      <div>
        <TaskSectionHeader
          title={`${dateLabel}의 할 일`}
          description={
            !canCreate
              ? '기록만 확인할 수 있어요. 지난 날짜에는 할 일을 추가할 수 없어요.'
              : isToday
                ? '오늘 필요한 일만 가볍게 적어보세요'
                : '앞으로 필요한 일을 미리 준비해보세요.'
          }
          addLabel="할 일 추가"
          onAdd={() => setForm({ mode: 'create' })}
          showAdd={canCreate}
        />
        <div className="space-y-3">
          {loading ? (
            <TaskLoadingState label="할 일" />
          ) : loadError && todos.length === 0 ? (
            <TaskErrorState
              title="할 일을 불러오지 못했어요."
              description={loadError}
              onRetry={() => void fetchTodos(selectedDate)}
            />
          ) : (
            <>
              {loadError ? (
                <TaskErrorState
                  title="최신 할 일을 불러오지 못했어요."
                  description="화면에는 이전에 불러온 내용을 보여드리고 있어요."
                  onRetry={() => void fetchTodos(selectedDate)}
                  compact
                />
              ) : null}

              {todos.length === 0 ? (
                <TaskEmptyState title={emptyState.title} description={emptyState.description} />
              ) : (
                todos.map((todo, index) => (
                  <SimpleTodoCard
                    key={todo.id}
                    todo={todo}
                    featured={index === 0}
                    onStatusChange={handleTodoStatusChange}
                    onDelete={() => setDeleteTarget(todo)}
                    onEdit={(target) => setForm({ mode: 'edit', todo: target })}
                    onEditReminder={(target) => setForm({ mode: 'reminder', todo: target })}
                    onRepeatChange={handleRepeatChange}
                    repeatSaving={savingRepeatIds.includes(todo.id)}
                  />
                ))
              )}
            </>
          )}
        </div>
      </div>

      <TodoFormModal
        form={form}
        selectedDate={selectedDate}
        onClose={() => setForm(null)}
        onSubmit={handleSubmitTodo}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title="이 할 일을 삭제할까요?"
        description={
          deleteTarget
            ? deleteTarget.repeatDaily && deleteTarget.date >= today
              ? `‘${deleteTarget.title}’ 할 일을 삭제하고 앞으로의 매일 반복을 중단해요.`
              : `‘${deleteTarget.title}’ 할 일을 목록에서 삭제해요.`
            : '선택한 할 일을 삭제해요.'
        }
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (!deleteTarget) return;
          return handleDeleteTodo(deleteTarget.id);
        }}
      />
    </>
  );
}
