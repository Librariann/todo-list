import { create } from 'zustand';
import { getTodayDateString } from '../lib/dateUtils';

interface CalendarState {
  selectedDate: string;
  currentMonth: Date;

  setSelectedDate: (date: string) => void;
  setCurrentMonth: (date: Date) => void;
  goToToday: () => void;
  resetCalendar: () => void;
}

function getMonthFromDate(dateString: string): Date {
  const [year, month] = dateString.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

function createInitialCalendar() {
  const today = getTodayDateString();

  return {
    selectedDate: today,
    currentMonth: getMonthFromDate(today),
  };
}

export const useCalendarStore = create<CalendarState>((set) => ({
  ...createInitialCalendar(),

  setSelectedDate: (date) => {
    set({
      selectedDate: date,
      currentMonth: getMonthFromDate(date),
    });
  },

  setCurrentMonth: (date) => {
    set({
      currentMonth: new Date(date.getFullYear(), date.getMonth(), 1),
    });
  },

  goToToday: () => {
    const today = getTodayDateString();

    set({
      selectedDate: today,
      currentMonth: getMonthFromDate(today),
    });
  },

  resetCalendar: () => {
    set(createInitialCalendar());
  },
}));
