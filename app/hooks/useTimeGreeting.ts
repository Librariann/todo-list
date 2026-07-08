import { useEffect, useState } from 'react';

const SEOUL_TIME_ZONE = 'Asia/Seoul';

interface SeoulTime {
  hour: number;
  minute: number;
  second: number;
}

export type GreetingPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeGreeting {
  message: string;
  period: GreetingPeriod;
}

function getSeoulTime(): SeoulTime {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SEOUL_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  const values = new Map(parts.map((part) => [part.type, Number(part.value)]));
  return {
    hour: values.get('hour') ?? 0,
    minute: values.get('minute') ?? 0,
    second: values.get('second') ?? 0,
  };
}

function getGreeting(hour: number): TimeGreeting {
  if (hour >= 5 && hour < 12) {
    return { message: '좋은 아침이에요', period: 'morning' };
  }

  if (hour >= 12 && hour < 14) {
    return { message: '좋은 점심이에요', period: 'afternoon' };
  }

  if (hour >= 14 && hour < 18) {
    return { message: '좋은 오후에요', period: 'afternoon' };
  }

  if (hour >= 18 && hour < 21) {
    return { message: '좋은 저녁이에요', period: 'evening' };
  }

  return { message: '좋은 밤이에요', period: 'night' };
}

function getMillisecondsUntilNextGreeting(time: SeoulTime): number {
  const nextBoundaryHour =
    time.hour < 5
      ? 5
      : time.hour < 12
        ? 12
        : time.hour < 14
          ? 14
          : time.hour < 18
            ? 18
            : time.hour < 21
              ? 21
              : 29;
  const remainingSeconds =
    (nextBoundaryHour - time.hour) * 60 * 60 - time.minute * 60 - time.second;

  return remainingSeconds * 1000 + 1000;
}

export function useTimeGreeting(): TimeGreeting {
  const [greeting, setGreeting] = useState(() => getGreeting(getSeoulTime().hour));

  useEffect(() => {
    let timeoutId: number;

    const scheduleNextGreeting = () => {
      const seoulTime = getSeoulTime();
      setGreeting(getGreeting(seoulTime.hour));
      timeoutId = window.setTimeout(
        scheduleNextGreeting,
        getMillisecondsUntilNextGreeting(seoulTime)
      );
    };

    scheduleNextGreeting();
    return () => window.clearTimeout(timeoutId);
  }, []);

  return greeting;
}
