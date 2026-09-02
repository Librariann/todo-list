'use client';

import HabitCard from '@/app/components/HabitCard';
import { TaskEmptyState, TaskLoadingState, TaskSectionHeader } from '../TaskSectionLayout';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { createHabit, decrementHabit, incrementHabit } from '@/app/lib/habitsApi';
import { updateHabitProgress } from '@/app/lib/habitUtils';
import CreateHabitsModal, { type CreateHabitInput } from './CreateHabitsModal';
import { useHabitsStore } from '@/app/store/habitsStore';
import { useUserSummaryStore } from '@/app/store/userSummaryStore';

export default function HabitSection() {
  const isAuthenticated = useAuthStore((auth) => auth.isAuthenticated);
  const habits = useHabitsStore((state) => state.habits);
  const loading = useHabitsStore((state) => state.isLoading);
  const fetchHabits = useHabitsStore((state) => state.fetchHabits);
  const setHabits = useHabitsStore((state) => state.setHabits);
  const refreshSummary = useUserSummaryStore((summary) => summary.refreshSummary);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void fetchHabits();
  }, [isAuthenticated, fetchHabits]);

  const handleHabitPositive = async (id: string) => {
    // 낙관적 업데이트
    setHabits((prev) => prev.map((h) => (h.id === id ? updateHabitProgress(h, 1) : h)));
    try {
      const updated = await incrementHabit(id);
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
      await refreshSummary();
    } catch {
      setHabits((prev) => prev.map((h) => (h.id === id ? updateHabitProgress(h, -1) : h)));
    }
  };

  const handleHabitNegative = async (id: string) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? updateHabitProgress(h, -1) : h)));
    try {
      const updated = await decrementHabit(id);
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
      await refreshSummary();
    } catch {
      setHabits((prev) => prev.map((h) => (h.id === id ? updateHabitProgress(h, 1) : h)));
    }
  };

  const handleCreateHabit = async (input: CreateHabitInput) => {
    const created = await createHabit({
      name: input.name,
      dailyTarget: input.dailyTarget,
    });
    setHabits((previousHabits) => [...previousHabits, created]);
  };

  return (
    <>
      <div>
        <TaskSectionHeader
          title="오늘의 습관"
          description="이번 주도 잘 이어가고 있어요"
          addLabel="습관 추가"
          onAdd={() => setIsCreateOpen(true)}
        />
        <div className="space-y-3">
          {loading ? (
            <TaskLoadingState label="습관" />
          ) : habits.length === 0 ? (
            <TaskEmptyState
              title="아직 기록한 습관이 없어요."
              description="매일 이어가고 싶은 작은 행동부터 적어보세요."
            />
          ) : (
            habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onPositive={handleHabitPositive}
                onNegative={handleHabitNegative}
              />
            ))
          )}
        </div>
      </div>

      <CreateHabitsModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateHabit}
      />
    </>
  );
}
