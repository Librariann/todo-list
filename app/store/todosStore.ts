import { create } from 'zustand';
import { fetchTodos } from '@/app/lib/todosApi';
import type { Todo } from '@/app/types/todo';

type TodosUpdater = Todo[] | ((todos: Todo[]) => Todo[]);

interface TodosState {
  todosByDate: Record<string, Todo[]>;
  loadingByDate: Record<string, boolean>;
  errorsByDate: Record<string, string | null>;
  fetchTodos: (date: string) => Promise<void>;
  setTodos: (date: string, updater: TodosUpdater) => void;
  resetTodos: () => void;
}

const activeRequests = new Map<string, Promise<void>>();
let requestGeneration = 0;

export const useTodosStore = create<TodosState>((set) => ({
  todosByDate: {},
  loadingByDate: {},
  errorsByDate: {},

  fetchTodos: async (date) => {
    const existingRequest = activeRequests.get(date);
    if (existingRequest) {
      return existingRequest;
    }

    const generation = requestGeneration;
    const request = (async () => {
      set((state) => ({
        loadingByDate: { ...state.loadingByDate, [date]: true },
        errorsByDate: { ...state.errorsByDate, [date]: null },
      }));

      try {
        const todos = await fetchTodos(date);
        if (generation === requestGeneration) {
          set((state) => ({
            todosByDate: { ...state.todosByDate, [date]: todos },
            loadingByDate: { ...state.loadingByDate, [date]: false },
          }));
        }
      } catch (error) {
        if (generation === requestGeneration) {
          set((state) => ({
            loadingByDate: { ...state.loadingByDate, [date]: false },
            errorsByDate: {
              ...state.errorsByDate,
              [date]: error instanceof Error ? error.message : '할 일을 불러오지 못했습니다.',
            },
          }));
        }
      }
    })();

    activeRequests.set(date, request);
    try {
      await request;
    } finally {
      if (activeRequests.get(date) === request) {
        activeRequests.delete(date);
      }
    }
  },

  setTodos: (date, updater) => {
    set((state) => {
      const currentTodos = state.todosByDate[date] ?? [];
      return {
        todosByDate: {
          ...state.todosByDate,
          [date]: typeof updater === 'function' ? updater(currentTodos) : updater,
        },
      };
    });
  },

  resetTodos: () => {
    requestGeneration += 1;
    activeRequests.clear();
    set({ todosByDate: {}, loadingByDate: {}, errorsByDate: {} });
  },
}));
