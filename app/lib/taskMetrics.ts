import { getTodayProgress } from '@/app/lib/habitUtils';
import type { Goal, Habit, Todo } from '@/app/types/todo';
import { GoalFrequency, TodoStatus } from '@/app/types/todo';

export interface TaskMetrics {
  completed: number;
  total: number;
}

export interface PeriodGoalMetrics {
  weekly: TaskMetrics;
  monthly: TaskMetrics;
}

function calculateGoalMetrics(goals: Goal[]): TaskMetrics {
  return {
    completed: goals.filter((goal) => goal.period?.isAchieved === true).length,
    total: goals.length,
  };
}

export function calculateTodayFlowMetrics(
  habits: Habit[],
  goals: Goal[],
  todos: Todo[]
): TaskMetrics {
  const completedHabits = habits.filter(
    (habit) => getTodayProgress(habit) >= (habit.dailyTarget || 5)
  ).length;
  const dailyGoals = goals.filter((goal) => goal.frequency === GoalFrequency.DAILY);
  const completedGoals = dailyGoals.filter((goal) => goal.period?.isAchieved === true).length;
  const completedTodos = todos.filter((todo) => todo.status === TodoStatus.DONE).length;

  return {
    completed: completedHabits + completedGoals + completedTodos,
    total: habits.length + dailyGoals.length + todos.length,
  };
}

export function calculatePeriodGoalMetrics(goals: Goal[]): PeriodGoalMetrics {
  return {
    weekly: calculateGoalMetrics(goals.filter((goal) => goal.frequency === GoalFrequency.WEEKLY)),
    monthly: calculateGoalMetrics(goals.filter((goal) => goal.frequency === GoalFrequency.MONTHLY)),
  };
}
