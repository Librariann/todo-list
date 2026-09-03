'use client';

import SimpleTodoCard from '@/app/components/SimpleTodoCard';
import { Todo, TodoStatus } from '@/app/types/todo';
import { TaskEmptyState, TaskLoadingState, TaskSectionHeader } from '../TaskSectionLayout';
import { useEffect, useState } from 'react';
import { formatDate, getTodayDateString } from '@/app/lib/dateUtils';
import { createTodo, deleteTodo, updateTodoStatus } from '@/app/lib/todosApi';
import { useCalendarStore } from '@/app/store/calendarStore';
import { useUserSummaryStore } from '@/app/store/userSummaryStore';
import { useAuthStore } from '@/app/store/authStore';
import { toast } from 'sonner';
import CreateTodoModal, { type CreateTodoInput } from './CreateTodoModal';
import ConfirmModal from '@/app/components/ConfirmModal';
import { useTodosStore } from '@/app/store/todosStore';

const EMPTY_TODOS: Todo[] = [];

export default function TodoSection() {
  const isAuthenticated = useAuthStore((auth) => auth.isAuthenticated);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Todo | null>(null);
  const selectedDate = useCalendarStore((calendar) => calendar.selectedDate);
  const todos = useTodosStore((state) => state.todosByDate[selectedDate] ?? EMPTY_TODOS);
  const loading = useTodosStore((state) => state.loadingByDate[selectedDate] ?? false);
  const fetchTodos = useTodosStore((state) => state.fetchTodos);
  const setTodosForDate = useTodosStore((state) => state.setTodos);
  const refreshSummary = useUserSummaryStore((summary) => summary.refreshSummary);
  const dateLabel = formatDate(selectedDate);
  const canCreate = selectedDate >= getTodayDateString();
  const isToday = selectedDate === getTodayDateString();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void fetchTodos(selectedDate);
  }, [fetchTodos, isAuthenticated, selectedDate]);

  const handleCreateTodo = async (input: CreateTodoInput) => {
    const created = await createTodo(input.name, selectedDate);
    setTodosForDate(selectedDate, (previousTodos) => [...previousTodos, created]);
    toast.success('할 일을 추가했어요.');
  };

  const handleDeleteTodo = async (todoId: string) => {
    const snapshot = todos;
    const afterDelete = todos.filter((t) => t.id !== todoId);
    setTodosForDate(selectedDate, afterDelete);

    try {
      await deleteTodo(todoId);
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
    const snapshot = [...todos];
    const target = snapshot.find((snapshot) => snapshot.id === todoId);

    const today = getTodayDateString();
    if (!target || target.date < today || (target.date > today && newStatus === TodoStatus.DONE)) {
      return;
    }

    const optimistic = snapshot.map((snapshot) => {
      if (snapshot.id !== todoId) {
        return snapshot;
      }

      const result =
        newStatus === TodoStatus.DONE
          ? { ...snapshot, status: newStatus, completedAt: new Date() }
          : { ...snapshot, status: newStatus, completedAt: undefined };

      return result;
    });

    setTodosForDate(selectedDate, optimistic);

    try {
      await updateTodoStatus(todoId, newStatus);
    } catch {
      setTodosForDate(selectedDate, snapshot);
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
          onAdd={() => setIsCreateOpen(true)}
          showAdd={canCreate}
        />
        <div className="space-y-3">
          {loading ? (
            <TaskLoadingState label="할 일" />
          ) : todos.length === 0 ? (
            <TaskEmptyState
              title="오늘 페이지가 비어 있어요."
              description="지금 끝내고 싶은 일을 한 줄로 적어보세요."
            />
          ) : (
            todos.map((todo, index) => (
              <SimpleTodoCard
                key={todo.id}
                todo={todo}
                featured={index === 0}
                onStatusChange={handleTodoStatusChange}
                onDelete={() => setDeleteTarget(todo)}
              />
            ))
          )}
        </div>
      </div>

      <CreateTodoModal
        open={isCreateOpen}
        selectedDate={selectedDate}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateTodo}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title="이 할 일을 삭제할까요?"
        description={
          deleteTarget
            ? `‘${deleteTarget.title}’ 할 일을 목록에서 삭제해요.`
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
