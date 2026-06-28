'use client';

import type { FormEvent, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TaskModalLayoutProps {
  open: boolean;
  title: string;
  children: ReactNode;
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function TaskModalLayout({
  open,
  title,
  children,
  submitting,
  onOpenChange,
  onSubmit,
}: TaskModalLayoutProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!submitting) onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <p className="journal-kicker">가볍게 시작해요</p>
          <DialogTitle className="friendly-heading text-2xl">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {children}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? '등록 중...' : '추가하기'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
