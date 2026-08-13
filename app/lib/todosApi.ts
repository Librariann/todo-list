import { apiFetch } from './apiClient';
import { Todo, TodoStatus } from '../types/todo';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface TodoApiResponse {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  status: 'READY' | 'PROCESS' | 'DONE';
  orderIndex: number;
  targetDate: string;
}

const STATUS_FROM_API: Record<string, TodoStatus> = {
  READY: TodoStatus.TODO,
  PROCESS: TodoStatus.IN_PROGRESS,
  DONE: TodoStatus.DONE,
};

const STATUS_TO_API: Record<TodoStatus, string> = {
  [TodoStatus.TODO]: 'READY',
  [TodoStatus.IN_PROGRESS]: 'PROCESS',
  [TodoStatus.DONE]: 'DONE',
};

export function mapApiTodo(raw: TodoApiResponse): Todo {
  return {
    id: raw.id.toString(),
    title: raw.name,
    status: STATUS_FROM_API[raw.status] ?? TodoStatus.TODO,
    date: raw.targetDate,
    createdAt: new Date(raw.createdAt),
    completedAt: raw.status === 'DONE' ? new Date(raw.updatedAt) : undefined,
  };
}

export async function fetchTodos(date: string): Promise<Todo[]> {
  const res = await apiFetch(`${API_URL}/api/todos/${date}`);
  if (!res.ok) throw new Error('Failed to fetch todos');
  const data = await res.json();
  return ((data.data ?? []) as TodoApiResponse[]).map(mapApiTodo);
}

export async function createTodo(name: string, targetDate: string): Promise<Todo> {
  const res = await apiFetch(`${API_URL}/api/todos/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, targetDate }),
  });
  if (!res.ok) throw new Error('Failed to create todo');
  const data = await res.json();
  return mapApiTodo(data.data as TodoApiResponse);
}

export async function updateTodoStatus(id: string, status: TodoStatus): Promise<void> {
  const apiStatus = STATUS_TO_API[status];
  const res = await apiFetch(`${API_URL}/api/todos/${id}/status/${apiStatus}`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Failed to update todo status');
}

export async function deleteTodo(id: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/api/todos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete todo');
}

export async function fetchCompletedDatesInMonth(
  year: number,
  month: number
): Promise<Set<string>> {
  // month: 1-indexed (1=Jan, 12=Dec)
  const daysInMonth = new Date(year, month, 0).getDate();
  const dates: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  }

  const results = await Promise.allSettled(
    dates.map(async (date) => ({ date, todos: await fetchTodos(date) }))
  );

  const completedDates = new Set<string>();
  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { date, todos } = result.value;
      if (todos.some((t) => t.status === TodoStatus.DONE)) {
        completedDates.add(date);
      }
    }
  }
  return completedDates;
}
