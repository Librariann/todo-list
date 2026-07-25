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
  const percentage = Math.max(0, Math.min(100, value || 0));

  if (glow) {
    return (
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn('relative w-full rounded-full bg-primary/20', className)}
      >
        <div
          className="relative h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${percentage}%` }}
        >
          {percentage > 1 && percentage < 100 && (
            <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent" />
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
