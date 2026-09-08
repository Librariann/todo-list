'use client';

import GoalCard from '@/app/components/GoalCard';
import type { Goal, GoalWithDate } from '@/app/types/todo';
import { achieveGoal, createGoal, deleteGoal } from '@/app/lib/goalsApi';
import { useCalendarStore } from '@/app/store/calendarStore';
import { useEffect, useMemo, useState } from 'react';
import { TaskEmptyState, TaskLoadingState, TaskSectionHeader } from '../TaskSectionLayout';
import CreateGoalModal, { type CreateGoalInput } from './CreateGoalModal';
import ConfirmModal from '@/app/components/ConfirmModal';
import { toast } from 'sonner';
import { formatDate, getDatesInRange, getTodayDateString } from '@/app/lib/dateUtils';
import { useAuthStore } from '@/app/store/authStore';
import { useGoalsStore } from '@/app/store/goalsStore';
import { useUserSummaryStore } from '@/app/store/userSummaryStore';
import { getAwardedPoints, notifyChallengeAchievements } from '@/app/lib/challengeNotifications';

const EMPTY_GOALS: Goal[] = [];

export default function GoalSection() {
  const selectedDate = useCalendarStore((calendar) => calendar.selectedDate);
  const goals = useGoalsStore((state) => state.goalsByDate[selectedDate] ?? EMPTY_GOALS);
  const loading = useGoalsStore((state) => state.loadingByDate[selectedDate] ?? false);
  const fetchGoals = useGoalsStore((state) => state.fetchGoals);
  const setGoalsForDate = useGoalsStore((state) => state.setGoals);
  const refreshSummary = useUserSummaryStore((summary) => summary.refreshSummary);
  const adjustPoints = useUserSummaryStore((summary) => summary.adjustPoints);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GoalWithDate | null>(null);
  const dateLabel = formatDate(selectedDate);
  const canCreate = selectedDate >= getTodayDateString();
  const isAuthenticated = useAuthStore((auth) => auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    void fetchGoals(selectedDate);
  }, [fetchGoals, isAuthenticated, selectedDate]);

  // 선택된 날짜의 목표 (완료 여부 포함)
  const goalsWithCompletion = useMemo<GoalWithDate[]>(() => {
    const result: GoalWithDate[] = [];
    goals.forEach((goal) => {
      if (goal.period) {
        result.push({ ...goal, period: goal.period, completed: goal.period.isAchieved });
      }
    });
    return result;
  }, [goals]);

  const handleGoalToggle = async (id: string) => {
    const target = goals.find((d) => d.id === id);

    if (!target?.period?.canAchieve) {
      return;
    }

    const snapshot = goals;
    const achievedAt = new Date().toISOString();

    setGoalsForDate(selectedDate, (prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        return {
          ...d,
          streak: d.streak + 1,
          completedDates: getDatesInRange(target.period!.start, target.period!.end),
          period: {
            ...target.period!,
            currentCount: target.period!.targetCount,
            isAchieved: true,
            achievedAt,
            status: 'ACHIEVED' as const,
            canAchieve: false,
          },
        };
      })
    );
    try {
      const result = await achieveGoal(id);
      adjustPoints(getAwardedPoints(result.achievements));
      notifyChallengeAchievements(result.achievements);
      await Promise.all([fetchGoals(selectedDate, true), refreshSummary()]);
      if (result.achievements.length === 0) {
        toast.success('목표가 완료됐어요', {
          description: '이번 기간 전체에 완료 상태가 반영됐어요.',
        });
      }
    } catch (error) {
      setGoalsForDate(selectedDate, snapshot);
      toast.error(error instanceof Error ? error.message : '목표를 완료하지 못했습니다.');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    const deletedIndex = goals.findIndex((goal) => goal.id === id);
    const deletedGoal = goals[deletedIndex];

    if (!deletedGoal) {
      return;
    }

    setGoalsForDate(selectedDate, (previousGoals) =>
      previousGoals.filter((goal) => goal.id !== id)
    );

    try {
      await deleteGoal(id);
      toast.success('목표를 삭제했어요.');
    } catch (error) {
      setGoalsForDate(selectedDate, (previousGoals) => {
        if (previousGoals.some((goal) => goal.id === id)) return previousGoals;

        const restoredGoals = [...previousGoals];
        restoredGoals.splice(deletedIndex, 0, deletedGoal);
        return restoredGoals;
      });
      toast.error(error instanceof Error ? error.message : '목표를 삭제하지 못했습니다.');
      throw error;
    }
  };

  const handleGoalCreated = async (input: CreateGoalInput) => {
    await createGoal(input.name, input.recurrenceType, selectedDate);
    await fetchGoals(selectedDate, true);
    toast.success('목표를 추가했어요.');
  };

  return (
    <>
      <div>
        <TaskSectionHeader
          title={`${dateLabel}의 목표`}
          description={
            canCreate
              ? '내가 정한 속도로 천천히 이어가요'
              : '기록만 확인할 수 있어요. 지난 날짜에는 목표를 추가할 수 없어요.'
          }
          addLabel="목표 추가"
          onAdd={() => setIsCreateOpen(true)}
          showAdd={canCreate}
        />
        <div className="space-y-3">
          {loading ? (
            <TaskLoadingState label="목표" />
          ) : goalsWithCompletion.length === 0 ? (
            <TaskEmptyState
              title="이 날짜에 진행 중인 목표가 없어요."
              description="목표는 생성한 날짜부터 달력에 표시돼요."
            />
          ) : (
            goalsWithCompletion.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onToggle={handleGoalToggle}
                onDelete={() => setDeleteTarget(goal)}
              />
            ))
          )}
        </div>
      </div>

      <CreateGoalModal
        open={isCreateOpen}
        selectedDate={selectedDate}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleGoalCreated}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title="이 목표를 삭제할까요?"
        description={
          deleteTarget
            ? `‘${deleteTarget.title}’ 목표와 쌓인 기록을 함께 삭제해요.`
            : '선택한 목표를 삭제해요.'
        }
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={() => {
          if (!deleteTarget) {
            return;
          }
          return handleDeleteGoal(deleteTarget.id);
        }}
      />
    </>
  );
}
