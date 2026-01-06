import { Habit, Daily, Todo, TodoStatus } from '@/app/types/todo'
import { isCompletedToday, calculateStreak } from './habitUtils'

export interface ProgressMetrics {
  habitsCompletedToday: number
  totalHabitsToday: number
  dailiesCompletedToday: number
  totalDailiesToday: number
  todosCompletedToday: number
  totalTodosToday: number
  averageHabitStreak: number
  totalPointsEarned: number
  perfectDays: number
}

export function calculateDailyPoints(
  habits: Habit[],
  dailies: Daily[],
  todos: Todo[],
  selectedDate: string = new Date().toISOString().split('T')[0]
): number {
  let points = 0

  habits.forEach(habit => {
    if (isCompletedToday(habit)) {
      const basePoints = 10
      const streakBonus = Math.min(calculateStreak(habit) * 2, 50)
      points += basePoints + streakBonus
    }
  })

  dailies.forEach(daily => {
    if (daily.completedDates.includes(selectedDate)) {
      const basePoints = 15
      const streakBonus = Math.min(daily.streak * 3, 75)
      points += basePoints + streakBonus
    }
  })

  todos.forEach(todo => {
    if (todo.status === TodoStatus.DONE && todo.date === selectedDate) {
      points += 5
    }
  })

  return points
}

export function calculateProgressMetrics(
  habits: Habit[],
  dailies: Daily[],
  todos: Todo[],
  selectedDate: string = new Date().toISOString().split('T')[0]
): ProgressMetrics {
  const habitsCompletedToday = habits.filter(isCompletedToday).length
  const dailiesCompletedToday = dailies.filter(daily => 
    daily.completedDates.includes(selectedDate)
  ).length
  
  const todosToday = todos.filter(todo => todo.date === selectedDate)
  const todosCompletedToday = todosToday.filter(todo => 
    todo.status === TodoStatus.DONE
  ).length

  const averageHabitStreak = habits.length > 0 
    ? habits.reduce((sum, habit) => sum + calculateStreak(habit), 0) / habits.length
    : 0

  const dailyPoints = calculateDailyPoints(habits, dailies, todos, selectedDate)
  
  const perfectDays = calculatePerfectDays(habits, dailies, 30)

  return {
    habitsCompletedToday,
    totalHabitsToday: habits.length,
    dailiesCompletedToday,
    totalDailiesToday: dailies.length,
    todosCompletedToday,
    totalTodosToday: todosToday.length,
    averageHabitStreak: Math.round(averageHabitStreak * 10) / 10,
    totalPointsEarned: dailyPoints,
    perfectDays
  }
}

export function calculatePerfectDays(
  habits: Habit[],
  dailies: Daily[],
  daysToCheck: number = 30
): number {
  let perfectDays = 0
  
  for (let i = 0; i < daysToCheck; i++) {
    const checkDate = new Date()
    checkDate.setDate(checkDate.getDate() - i)
    const dateStr = checkDate.toISOString().split('T')[0]
    
    const allHabitsCompleted = habits.length === 0 || habits.every(habit => {
      const progress = habit.dailyProgress?.[dateStr] || 0
      const target = habit.dailyTarget || 5
      return progress >= target
    })
    
    const allDailiesCompleted = dailies.length === 0 || dailies.every(daily =>
      daily.completedDates.includes(dateStr)
    )
    
    if (allHabitsCompleted && allDailiesCompleted && (habits.length > 0 || dailies.length > 0)) {
      perfectDays++
    }
  }
  
  return perfectDays
}

export function getRewardTier(totalPoints: number): {
  tier: string
  nextTierPoints: number
  progress: number
} {
  const tiers = [
    { name: '브론즈', min: 0, max: 100 },
    { name: '실버', min: 100, max: 300 },
    { name: '골드', min: 300, max: 600 },
    { name: '플래티넘', min: 600, max: 1000 },
    { name: '다이아몬드', min: 1000, max: 1500 },
    { name: '마스터', min: 1500, max: Infinity }
  ]

  const currentTier = tiers.find(tier => totalPoints >= tier.min && totalPoints < tier.max)
  const currentTierIndex = tiers.findIndex(tier => tier === currentTier)
  const nextTier = tiers[currentTierIndex + 1]

  if (!currentTier) {
    return { tier: '브론즈', nextTierPoints: 100, progress: 0 }
  }

  const progress = nextTier 
    ? ((totalPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100

  return {
    tier: currentTier.name,
    nextTierPoints: nextTier?.min || currentTier.max,
    progress: Math.min(progress, 100)
  }
}

export function generateAchievements(metrics: ProgressMetrics): string[] {
  const achievements: string[] = []

  if (metrics.perfectDays >= 7) {
    achievements.push('🏆 완벽한 일주일 달성!')
  }
  
  if (metrics.perfectDays >= 30) {
    achievements.push('🌟 완벽한 한 달 달성!')
  }

  if (metrics.averageHabitStreak >= 10) {
    achievements.push('🔥 습관 마스터 (평균 10일 연속!)')
  }

  if (metrics.habitsCompletedToday === metrics.totalHabitsToday && metrics.totalHabitsToday > 0) {
    achievements.push('💪 오늘의 모든 습관 완료!')
  }

  if (metrics.dailiesCompletedToday === metrics.totalDailiesToday && metrics.totalDailiesToday > 0) {
    achievements.push('✅ 오늘의 모든 일일목표 완료!')
  }

  if (metrics.todosCompletedToday === metrics.totalTodosToday && metrics.totalTodosToday > 0) {
    achievements.push('📝 오늘의 모든 할일 완료!')
  }

  if (metrics.totalPointsEarned >= 100) {
    achievements.push('🎯 오늘 100포인트 돌파!')
  }

  return achievements
}