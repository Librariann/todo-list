'use client';

import { Todo, Habit, Goal, UserStats } from '@/app/types/todo';

export interface UserData {
  todos: Todo[];
  habits: Habit[];
  goals: Goal[];
  userStats: UserStats;
  lastUpdated: string;
}

const STORAGE_PREFIX = 'todo-master-';

export class UserStorage {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private getStorageKey(type: string): string {
    return `${STORAGE_PREFIX}${this.userId}-${type}`;
  }

  private safeGetItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private safeSetItem(key: string, value: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  getTodos(): Todo[] {
    const stored = this.safeGetItem(this.getStorageKey('todos'));
    if (!stored) return [];

    try {
      const todos = JSON.parse(stored);
      return todos.map((todo: Todo & { createdAt: string; completedAt?: string }) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
      }));
    } catch {
      return [];
    }
  }

  saveTodos(todos: Todo[]): boolean {
    return this.safeSetItem(this.getStorageKey('todos'), JSON.stringify(todos));
  }

  getHabits(): Habit[] {
    const stored = this.safeGetItem(this.getStorageKey('habits'));
    if (!stored) return [];

    try {
      const habits = JSON.parse(stored);
      return habits.map((habit: Habit & { createdAt: string }) => ({
        ...habit,
        createdAt: new Date(habit.createdAt),
      }));
    } catch {
      return [];
    }
  }

  saveHabits(habits: Habit[]): boolean {
    return this.safeSetItem(this.getStorageKey('habits'), JSON.stringify(habits));
  }

  getGoals(): Goal[] {
    const stored =
      this.safeGetItem(this.getStorageKey('goals')) ??
      this.safeGetItem(this.getStorageKey('dailies'));
    if (!stored) return [];

    try {
      const goals = JSON.parse(stored);
      return goals.map((goal: Goal & { createdAt: string }) => ({
        ...goal,
        createdAt: new Date(goal.createdAt),
      }));
    } catch {
      return [];
    }
  }

  saveGoals(goals: Goal[]): boolean {
    return this.safeSetItem(this.getStorageKey('goals'), JSON.stringify(goals));
  }

  getUserStats(): UserStats | null {
    const stored = this.safeGetItem(this.getStorageKey('stats'));
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  saveUserStats(stats: UserStats): boolean {
    return this.safeSetItem(this.getStorageKey('stats'), JSON.stringify(stats));
  }

  getAllData(): UserData | null {
    const todos = this.getTodos();
    const habits = this.getHabits();
    const goals = this.getGoals();
    const userStats = this.getUserStats();

    if (!userStats) return null;

    return {
      todos,
      habits,
      goals,
      userStats,
      lastUpdated: new Date().toISOString(),
    };
  }

  saveAllData(data: Partial<UserData>): boolean {
    let success = true;

    if (data.todos) success = this.saveTodos(data.todos) && success;
    if (data.habits) success = this.saveHabits(data.habits) && success;
    if (data.goals) success = this.saveGoals(data.goals) && success;
    if (data.userStats) success = this.saveUserStats(data.userStats) && success;

    return success;
  }

  clearAllData(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const keys = ['todos', 'habits', 'goals', 'dailies', 'stats'];
      keys.forEach((key) => {
        localStorage.removeItem(this.getStorageKey(key));
      });
      return true;
    } catch {
      return false;
    }
  }

  exportData(): string {
    const data = this.getAllData();
    return JSON.stringify(data, null, 2);
  }

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString) as UserData;
      return this.saveAllData(data);
    } catch {
      return false;
    }
  }
}

export function getUserStorage(userId?: string | null): UserStorage | null {
  if (!userId) return null;
  return new UserStorage(userId);
}
