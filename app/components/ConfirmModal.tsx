'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  cancelLabel?: string;
  pendingLabel?: string;
  warning?: string;
}

export default function ConfirmModal({
  open,
  title,
  description,
  onOpenChange,
  onConfirm,
  confirmLabel = '삭제하기',
  cancelLabel = '취소',
  pendingLabel = '삭제하는 중...',
  warning = '삭제한 내용은 다시 되돌릴 수 없어요.',
}: ConfirmModalProps) {
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return;
    if (!nextOpen) setErrorMessage('');
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    setIsPending(true);
    setErrorMessage('');

    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '처리하지 못했어요. 다시 시도해 주세요.'
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden rounded-[1.5rem] border-stone-200 p-0 sm:max-w-[25rem] dark:border-white/10"
        showCloseButton={false}
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (isPending) event.preventDefault();
        }}
      >
        <DialogHeader className="px-6 pb-4 pt-6 text-left">
          <DialogTitle className="friendly-heading text-xl leading-snug">{title}</DialogTitle>
          <DialogDescription className="pt-1 text-sm leading-6">{description}</DialogDescription>
        </DialogHeader>

        <div className="mx-6 rounded-xl bg-destructive/7 px-4 py-3 text-sm text-destructive dark:bg-destructive/12">
          {warning}
        </div>

        {errorMessage ? (
          <p role="alert" className="px-6 pt-3 text-sm font-medium text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <DialogFooter className="mt-5 border-t border-stone-200/80 px-6 py-4 sm:grid sm:grid-cols-2 dark:border-white/10">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-11 rounded-xl"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
