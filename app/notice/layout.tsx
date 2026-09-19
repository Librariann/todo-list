import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ThemeToggleStandalone from '@/app/components/ThemeToggleStandalone';

export const metadata: Metadata = { title: '공지사항 | GrowDo' };

export default function NoticeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background px-3 py-3 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-border bg-card">
        <header className="flex min-h-20 items-center justify-between gap-3 border-b border-border px-5 sm:px-8">
          <Link href="/" className="flex min-h-11 items-center gap-2" aria-label="GrowDo 홈">
            <Image src="/growdo-logo.png" alt="" width={36} height={36} className="rounded-xl" />
            <span className="friendly-heading text-xl font-bold">GrowDo</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              <span>오늘로</span>
            </Link>
            <ThemeToggleStandalone />
          </div>
        </header>
        <main className="min-h-[60vh] px-5 py-10 sm:px-12 sm:py-14">{children}</main>
      </div>
    </div>
  );
}
