'use client';

import { useMemo } from 'react';

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
  onMonthChange 
}: CalendarProps) {
  
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
    return date.toISOString().split('T')[0];
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

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="이전 달"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="text-center">
          <h3 className="font-bold text-gray-900 dark:text-gray-100">
            {formatMonthYear(currentMonth)}
          </h3>
          <button
            onClick={goToToday}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
          >
            오늘
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="다음 달"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center text-xs font-semibold py-2 ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
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
                aspect-square rounded-lg text-sm font-medium transition-all relative
                ${selectedFlag 
                  ? 'bg-indigo-600 text-white shadow-md scale-105' 
                  : todayFlag
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }
                ${!selectedFlag && (
                  isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-gray-900 dark:text-gray-100'
                )}
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
