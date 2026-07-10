const SEOUL_TIME_ZONE = 'Asia/Seoul';

export function getDateStringInSeoul(date: Date): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: SEOUL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getTodayDateString(): string {
  return getDateStringInSeoul(new Date());
}

export function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);

  while (current <= last) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

// 날짜 포맷팅
export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === getDateStringInSeoul(today)) {
    return '오늘';
  } else if (dateStr === getDateStringInSeoul(yesterday)) {
    return '어제';
  } else {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  }
};
