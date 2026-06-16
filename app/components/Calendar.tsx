'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  // markedDates?: string[]; // 데이터가 있는 날짜들
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  // markedDates,
  currentMonth,
  onMonthChange,
}: CalendarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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

  // const hasData = (date: Date) => {
  //   return markedDates.includes(toDateString(date));
  // };

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
    <Card className="soft-panel border-border bg-card p-4 shadow-none">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <Button onClick={goToPreviousMonth} variant="ghost" size="sm" aria-label="이전 달">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-center lg:cursor-default flex flex-col items-center gap-1 cursor-pointer rounded-md px-3 py-1 hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground">{formatMonthYear(currentMonth)}</h3>
            <ChevronDown
              className={`w-4 h-4 lg:hidden transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </div>
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

        <Button onClick={goToNextMonth} variant="ghost" size="sm" aria-label="다음 달">
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
          // const dataFlag = hasData(date);

          return (
            <Button
              key={toDateString(date)}
              onClick={() => onDateSelect(toDateString(date))}
              variant={selectedFlag ? 'default' : todayFlag ? 'secondary' : 'ghost'}
              size="sm"
              className={`
                aspect-square text-sm font-medium transition-all relative p-0
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
              <span className="block">{date.getDate()}</span>
              {/* 데이터 있음 표시 점 */}
              {/* {dataFlag && !selectedFlag && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )} */}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
