'use client';

import { useEffect, useState } from 'react';
import { isNativeWebView } from '@/app/lib/nativeBridge';

export default function ChallengeAdSlot() {
  const [showPreview, setShowPreview] = useState<boolean>(false);

  useEffect(() => {
    setShowPreview(process.env.NODE_ENV === 'development' && !isNativeWebView());
  }, []);

  // 승인된 광고 단위를 연결하기 전에는 운영 노출과 광고 요청을 하지 않습니다.
  if (!showPreview) return null;

  return (
    <aside aria-label="광고 영역 미리보기" className="min-w-0 border-t border-border pt-5">
      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <span>광고</span>
        <span>개발 미리보기</span>
      </div>
      <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center sm:min-h-24">
        <p className="text-xs leading-relaxed text-muted-foreground">
          애드센스 승인 후 이곳에 광고가 표시돼요.
        </p>
      </div>
    </aside>
  );
}
