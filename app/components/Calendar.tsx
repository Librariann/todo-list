'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  markedDates?: ReadonlySet<string>;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  markedDates = new Set<string>(),
  currentMonth,
  onMonthChange,
}: CalendarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  // 달력 데이터 생성
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // 이번 달 첫날과 마지막날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 첫 주 시작 요일 (0: 일요일)
    const startDayOfWeek = firstDay.getDay();

    // 달력에 표시할 날짜들
    const days: (Date | null)[] = [];

    // 이전 달의 빈 칸
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // 이번 달 날짜들
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentMonth]);

  const formatMonthYear = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  const toDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return toDateString(date) === selectedDate;
  };

  const hasData = (date: Date) => markedDates.has(toDateString(date));

  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    onMonthChange(today);
    onDateSelect(toDateString(today));
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <Card className="soft-panel min-w-0 border-border bg-card p-3 shadow-none sm:p-4">
      {/* 헤더 */}
      <div className="mb-4 grid grid-cols-[2.25rem_minmax(0,1fr)_2.25rem] items-center gap-1">
        <Button onClick={goToPreviousMonth} variant="ghost" size="icon-sm" aria-label="이전 달">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex min-w-0 flex-col items-center gap-1 text-center">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            className="flex min-h-8 max-w-full items-center justify-center gap-1 rounded-md px-1 transition-colors hover:bg-accent dark:hover:bg-secondary"
          >
            <span className="whitespace-nowrap text-sm font-bold text-foreground sm:text-base">
              {formatMonthYear(currentMonth)}
            </span>
            <ChevronDown
              className={`size-4 shrink-0 lg:hidden transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              goToToday();
            }}
            variant="link"
            size="sm"
            className="text-xs text-primary p-0 h-auto"
          >
            오늘
          </Button>
        </div>

        <Button onClick={goToNextMonth} variant="ghost" size="icon-sm" aria-label="다음 달">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 요일 헤더 - 모바일에서는 펼쳤을 때만, 데스크톱에서는 항상 표시 */}
      <div className={`grid grid-cols-7 gap-1 mb-2 ${isExpanded ? 'block' : 'hidden lg:grid'}`}>
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center text-xs font-semibold py-2 ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-muted-foreground'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 - 모바일에서는 펼쳤을 때만, 데스크톱에서는 항상 표시 */}
      <div className={`grid grid-cols-7 gap-1 ${isExpanded ? 'grid' : 'hidden lg:grid'}`}>
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const isSunday = date.getDay() === 0;
          const isSaturday = date.getDay() === 6;
          const todayFlag = isToday(date);
          const selectedFlag = isSelected(date);
          const dataFlag = hasData(date);
          const dateLabel = `${date.getMonth() + 1}월 ${date.getDate()}일${dataFlag ? ', 등록된 항목 있음' : ''}`;

          return (
            <Button
              key={toDateString(date)}
              onClick={() => onDateSelect(toDateString(date))}
              aria-label={dateLabel}
              variant={selectedFlag ? 'default' : todayFlag ? 'secondary' : 'ghost'}
              size="sm"
              className={`
                aspect-square h-auto min-h-8 w-full p-0 text-sm font-medium transition-all
                ${selectedFlag ? 'font-bold' : ''}
                ${todayFlag && !selectedFlag ? 'bg-primary/10 text-primary' : ''}
                ${
                  !selectedFlag &&
                  !todayFlag &&
                  (isSunday
                    ? 'text-red-500 hover:text-red-600'
                    : isSaturday
                      ? 'text-blue-500 hover:text-blue-600'
                      : 'text-foreground')
                }
              `}
            >
              <span className="flex flex-col items-center justify-center gap-1.5">
                <span className="leading-none">{date.getDate()}</span>
                <span
                  aria-hidden="true"
                  className={`size-[3px] rounded-full ${
                    dataFlag
                      ? selectedFlag
                        ? 'bg-primary-foreground'
                        : 'bg-primary'
                      : 'opacity-0'
                  }`}
                />
              </span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
