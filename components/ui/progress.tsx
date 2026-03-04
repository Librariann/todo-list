'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

function Progress({
  className,
  value,
  glow = false,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { glow?: boolean }) {
  const pct = Math.max(0, Math.min(100, value || 0));

  if (glow) {
    return (
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn('relative w-full rounded-full bg-primary/20', className)}
      >
        {/* 채워지는 바 - 두 겹 글로우 (중심광 + 주변광) */}
        <div
          className="relative h-full rounded-full bg-primary transition-all duration-500 animate-glow-pulse"
          style={{ width: `${pct}%` }}
        >
          {/* 끝부분 흰색 헤드라이트 팁 */}
          {pct > 3 && pct < 100 && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-4 bg-indigo-100 rounded-full blur-[4px] opacity-55 shadow-[0_0_8px_#c7d2fe]" />
          )}
        </div>
      </div>
    );
  }

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn('bg-primary/20 relative h-2 w-full overflow-hidden rounded-full', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
