import { TodoStatus, type Habit, type Todo } from '@/app/types/todo';
import type { NativeWidgetSnapshot } from '@/app/lib/nativeBridge';

export function buildNativeWidgetData(
  date: string,
  todos: Todo[],
  habits: Habit[]
): Omit<NativeWidgetSnapshot, 'updatedAt'> {
  const todayTodos = todos.filter((todo) => todo.date === date);
  const completedTodos = todayTodos.filter((todo) => todo.status === TodoStatus.DONE);
  const pendingTodos = todayTodos.filter((todo) => todo.status !== TodoStatus.DONE);

  return {
    date,
    todos: [...pendingTodos, ...completedTodos].slice(0, 3).map((todo) => ({
      id: todo.id,
      title: Array.from(todo.title.trim()).slice(0, 100).join(''),
      completed: todo.status === TodoStatus.DONE,
    })),
    todoTotal: todayTodos.length,
    todoCompleted: completedTodos.length,
    habitTotal: habits.length,
    habitCompleted: habits.filter(
      (habit) => (habit.dailyProgress?.[date] ?? 0) >= (habit.dailyTarget || 5)
    ).length,
    habitProgress:
      habits.length === 0
        ? 0
        : Math.round(
            (habits.reduce(
              (total, habit) =>
                total +
                Math.max(
                  0,
                  Math.min(1, (habit.dailyProgress?.[date] ?? 0) / (habit.dailyTarget || 5))
                ),
              0
            ) /
              habits.length) *
              100
          ),
  };
}
