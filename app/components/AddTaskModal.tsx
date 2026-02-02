'use client';

import { useState } from 'react';
import { TaskType, HabitType, DailyFrequency, Habit, Daily, Todo, TodoStatus } from '../types/todo';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskType: TaskType;
  onAdd: (task: Habit | Daily | Todo) => void;
}

export default function AddTaskModal({ isOpen, onClose, taskType, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<DailyFrequency>(DailyFrequency.DAILY);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyTarget, setDailyTarget] = useState(5);

  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('제목을 입력해주세요');
      return;
    }

    const now = new Date();

    if (taskType === TaskType.HABIT) {
      const newHabit: Habit = {
        id: `h${Date.now()}`,
        title: title.trim(),
        habitType: HabitType.POSITIVE,
        positiveCount: 0,
        negativeCount: 0,
        dailyTarget,
        dailyProgress: {},
        lastUpdatedDate: now.toISOString().split('T')[0],
        createdAt: now,
      };
      onAdd(newHabit);
    } else if (taskType === TaskType.DAILY) {
      const newDaily: Daily = {
        id: `d${Date.now()}`,
        title: title.trim(),
        frequency,
        completedDates: [],
        streak: 0,
        createdAt: now,
      };
      onAdd(newDaily);
    } else if (taskType === TaskType.TODO) {
      const newTodo: Todo = {
        id: `t${Date.now()}`,
        title: title.trim(),
        status: TodoStatus.TODO,
        date,
        createdAt: now,
      };
      onAdd(newTodo);
    }

    // 초기화
    setTitle('');
    setFrequency(DailyFrequency.DAILY);
    setDate(new Date().toISOString().split('T')[0]);
    setDailyTarget(5);
    onClose();
  };

  const getModalTitle = () => {
    switch (taskType) {
      case TaskType.HABIT:
        return '새 습관 추가';
      case TaskType.DAILY:
        return '새 일일목표 추가';
      case TaskType.TODO:
        return '새 할일 추가';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 제목 입력 */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium mb-2">
              제목 *
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              autoFocus
            />
          </div>



          {taskType === TaskType.HABIT && (
            <div>
              <Label htmlFor="dailyTarget" className="text-sm font-medium mb-2">
                일일 목표 횟수
              </Label>
              <Input
                id="dailyTarget"
                type="number"
                min="1"
                max="50"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(parseInt(e.target.value) || 1)}
                placeholder="하루 목표 횟수"
              />
              <p className="text-xs text-muted-foreground mt-1">
                하루에 몇 번 수행할지 목표를 설정하세요 (1-50)
              </p>
            </div>
          )}


          {/* 일일목표 빈도 선택 */}
          {taskType === TaskType.DAILY && (
            <div>
              <Label className="text-sm font-medium mb-2">
                반복 주기
              </Label>
              <Select value={frequency} onValueChange={(value) => setFrequency(value as DailyFrequency)}>
                <SelectTrigger>
                  <SelectValue placeholder="반복 주기 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DailyFrequency.DAILY}>매일</SelectItem>
                  <SelectItem value={DailyFrequency.WEEKLY}>매주</SelectItem>
                  <SelectItem value={DailyFrequency.MONTHLY}>매월</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}



          {/* 할일 날짜 선택 */}
          {taskType === TaskType.TODO && (
            <div>
              <Label htmlFor="date" className="text-sm font-medium mb-2">
                날짜
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              추가하기
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
