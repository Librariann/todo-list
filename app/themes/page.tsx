import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import ThemeShowroom from '@/app/components/themes/ThemeShowroom';

export const metadata: Metadata = {
  title: '테마 상점 | GrowDo',
  description: '밤하늘, 해안 산책, 리듬 스튜디오. 그로우두의 세 가지 테마를 미리 둘러보세요.',
};

export default function ThemesPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border pt-[env(safe-area-inset-top)] pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]">
        <div className="mx-auto flex max-w-6xl items-center justify-between py-2 sm:py-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg pr-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            오늘로 돌아가기
          </Link>
          <span className="friendly-heading text-xl font-bold tracking-[-0.06em]">GrowDo</span>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl pt-8 pr-[max(1rem,env(safe-area-inset-right))] pb-[max(2.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] sm:pt-12">
        <div className="mb-6 border-b border-border pb-6 sm:mb-8 sm:pb-8">
          <p className="text-xs font-bold text-primary">테마 상점</p>
          <h1 className="friendly-heading mt-2 text-[clamp(2rem,5vw,3.75rem)] leading-[1.13] font-bold tracking-[-0.06em] break-keep">
            오늘을 어떤 분위기로 기록할까요?
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed break-keep text-muted-foreground sm:text-base">
            세 가지 테마를 미리 둘러보세요. 지금은 구매 없이 미리보기만 할 수 있어요.
          </p>
        </div>
        <ThemeShowroom />
      </main>
    </div>
  );
}
