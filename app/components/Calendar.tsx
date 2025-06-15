"use client";

import { useMemo, useState } from "react";

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  markedDates: string[]; // 데이터가 있는 날짜들
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  markedDates,
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

  const hasData = (date: Date) => {
    return markedDates.includes(toDateString(date));
  };

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

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="이전 달"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-center lg:cursor-default"
        >
          <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            {formatMonthYear(currentMonth)}
            <svg
              className={`w-4 h-4 lg:hidden transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToToday();
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1 cursor-pointer"
          >
            오늘
          </button>
        </button>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="다음 달"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 - 모바일에서는 펼쳤을 때만, 데스크톱에서는 항상 표시 */}
      <div className={`grid grid-cols-7 gap-1 mb-2 ${isExpanded ? 'block' : 'hidden lg:grid'}`}>
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center text-xs font-semibold py-2 ${
              index === 0
                ? "text-red-500"
                : index === 6
                ? "text-blue-500"
                : "text-gray-600 dark:text-gray-400"
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

          return (
            <button
              key={toDateString(date)}
              onClick={() => onDateSelect(toDateString(date))}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all relative cursor-pointer
                ${
                  selectedFlag
                    ? "bg-indigo-600 text-white shadow-md scale-105"
                    : todayFlag
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }
                ${
                  !selectedFlag &&
                  (isSunday
                    ? "text-red-500"
                    : isSaturday
                    ? "text-blue-500"
                    : "text-gray-900 dark:text-gray-100")
                }
              `}
            >
              <span className="block">{date.getDate()}</span>
              {/* 데이터 있음 표시 점 */}
              {dataFlag && !selectedFlag && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
