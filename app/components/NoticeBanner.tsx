'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Megaphone, Pause, Play } from 'lucide-react';
import { fetchNotices, type NoticeSummary } from '@/app/lib/noticesApi';

export default function NoticeBanner() {
  const [notices, setNotices] = useState<NoticeSummary[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [paused, setPaused] = useState<boolean>(false);
  const [hovered, setHovered] = useState<boolean>(false);
  const [focused, setFocused] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();
    let latestRequest = 0;
    const load = () => {
      const requestId = ++latestRequest;
      void fetchNotices(controller.signal)
        .then((items) => {
          if (!controller.signal.aborted && requestId === latestRequest) setNotices(items);
        })
        .catch(() => {
          /* An unavailable notice feed must not block daily tasks. */
        });
    };
    load();
    window.addEventListener('focus', load);
    return () => {
      controller.abort();
      window.removeEventListener('focus', load);
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (notices.length < 2 || paused || hovered || focused || reducedMotion) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % notices.length),
      6000
    );
    return () => window.clearInterval(timer);
  }, [notices.length, paused, hovered, focused, reducedMotion]);

  if (!notices.length) return null;
  const currentIndex = index % notices.length;
  const notice = notices[currentIndex];

  return (
    <aside
      aria-label="그로우두 공지사항"
      className="flex min-w-0 items-center gap-1 border-b border-primary/15 bg-primary/5 px-3 text-foreground sm:gap-3 sm:px-8"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <Megaphone aria-hidden="true" className="mr-1 size-4 shrink-0 text-primary" />
      <span className="hidden shrink-0 text-xs font-bold text-primary sm:inline">공지</span>
      <Link
        href={`/notice/${notice.id}`}
        title={notice.title}
        className="flex min-h-11 min-w-0 flex-1 items-center rounded-sm text-sm font-medium hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          key={`${notice.id}-${notice.updatedAt}`}
          className="truncate motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-300"
        >
          {notice.title}
        </span>
      </Link>
      {notices.length > 1 && (
        <div className="flex shrink-0 items-center">
          <span
            aria-label={`${notices.length}개 중 ${currentIndex + 1}번째 공지`}
            className="px-1 text-[11px] tabular-nums text-muted-foreground"
          >
            {currentIndex + 1}/{notices.length}
          </span>
          {!reducedMotion && (
            <button
              type="button"
              aria-label={paused ? '공지 자동 넘김 재생' : '공지 자동 넘김 일시정지'}
              onClick={() => setPaused(!paused)}
              className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
            >
              {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
            </button>
          )}
          <button
            type="button"
            aria-label="다음 공지"
            onClick={() => setIndex((current) => (current + 1) % notices.length)}
            className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
