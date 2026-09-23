'use client';

import { useEffect, useState } from 'react';
import { ImageOff, Maximize2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { fetchOwnedCouponImage } from '@/app/lib/rewardCouponsApi';

interface PrivateCouponImageProps {
  imagePath: string;
  alt: string;
}

export default function PrivateCouponImage({ imagePath, alt }: PrivateCouponImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setImageUrl(null);
    setError(null);

    fetchOwnedCouponImage(imagePath)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      })
      .catch((caught) => {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : '쿠폰 이미지를 불러오지 못했어요.');
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imagePath, retryKey]);

  if (error) {
    return (
      <div
        role="alert"
        className="mt-4 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-4 text-center"
      >
        <ImageOff className="h-5 w-5 text-muted-foreground" />
        <p className="mt-2 text-xs text-muted-foreground">{error}</p>
        <button
          type="button"
          onClick={() => setRetryKey((value) => value + 1)}
          className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-bold hover:bg-muted"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          다시 불러오기
        </button>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="mt-4 flex min-h-40 items-center justify-center rounded-xl bg-card">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" aria-label="쿠폰 이미지 불러오는 중" />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsViewerOpen(true)}
        onContextMenu={(event) => event.preventDefault()}
        className="group relative mt-4 block w-full overflow-hidden rounded-xl bg-card outline-none ring-primary/45 transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ WebkitTouchCallout: 'none' }}
        aria-label={`${alt} 크게 보기`}
      >
        {/* 인증된 API 응답을 메모리 URL로 바꿔 현재 사용자에게만 표시한다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          draggable={false}
          onDragStart={(event) => event.preventDefault()}
          className="pointer-events-none max-h-80 w-full select-none object-contain"
        />
        <span className="absolute bottom-3 right-3 hidden min-h-10 items-center gap-1.5 rounded-full bg-[#25372d]/90 px-3 text-xs font-bold text-[#f8f5ec] shadow-sm group-hover:flex group-focus-visible:flex sm:flex sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
          <Maximize2 className="h-3.5 w-3.5" />
          크게 보기
        </span>
      </button>

      <Button
        type="button"
        variant="outline"
        className="mt-3 h-11 w-full rounded-xl bg-card font-bold"
        onClick={() => setIsViewerOpen(true)}
      >
        <Maximize2 className="h-4 w-4" />
        쿠폰 크게 보기
      </Button>

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[56rem] gap-3 overflow-hidden rounded-[1.25rem] p-3 sm:w-[calc(100vw-2rem)] sm:p-5">
          <DialogHeader className="pr-10 text-left">
            <DialogTitle className="friendly-heading text-xl">쿠폰 크게 보기</DialogTitle>
            <DialogDescription>
              매장 직원이 바코드를 확인할 수 있도록 화면을 밝게 보여주세요.
            </DialogDescription>
          </DialogHeader>
          <div
            className="flex min-h-0 items-center justify-center overflow-auto rounded-xl bg-[#fffdf8] p-2 sm:p-4"
            onContextMenu={(event) => event.preventDefault()}
            style={{ WebkitTouchCallout: 'none' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={alt}
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
              className="pointer-events-none max-h-[calc(100dvh-8.5rem)] w-auto max-w-full select-none object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
