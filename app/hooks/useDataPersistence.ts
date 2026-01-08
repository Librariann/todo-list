'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/app/store/authStore'
import { Todo, Habit, Daily, UserStats } from '@/app/types/todo'
import { getUserStorage } from '@/app/lib/storage'

interface UseDataPersistenceProps {
  todos: Todo[]
  habits: Habit[]
  dailies: Daily[]
  userStats: UserStats
  onDataLoaded: (data: {
    todos: Todo[]
    habits: Habit[]
    dailies: Daily[]
    userStats: UserStats
  }) => void
}

export function useDataPersistence({
  todos,
  habits,
  dailies,
  userStats,
  onDataLoaded
}: UseDataPersistenceProps) {
  const { user } = useAuthStore()
  const isInitialized = useRef(false)
  const lastSaveTime = useRef<number>(0)

  const userId = user?.email

  useEffect(() => {
    if (!userId || isInitialized.current) return

    const storage = getUserStorage(userId)
    if (!storage) return

    const storedData = storage.getAllData()
    
    if (storedData) {
      onDataLoaded({
        todos: storedData.todos,
        habits: storedData.habits,
        dailies: storedData.dailies,
        userStats: storedData.userStats
      })
    } else {
      storage.saveAllData({
        todos,
        habits,
        dailies,
        userStats
      })
    }

    isInitialized.current = true
  }, [userId, onDataLoaded])

  useEffect(() => {
    if (!userId || !isInitialized.current) return

    const now = Date.now()
    if (now - lastSaveTime.current < 1000) return

    const storage = getUserStorage(userId)
    if (!storage) return

    storage.saveAllData({
      todos,
      habits,
      dailies,
      userStats
    })

    lastSaveTime.current = now
  }, [todos, habits, dailies, userStats, userId])

  return {
    isLoaded: isInitialized.current,
    userId,
    storage: userId ? getUserStorage(userId) : null
  }
}