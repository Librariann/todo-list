'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { fetchNotices, formatNoticeDate, type NoticeSummary } from '@/app/lib/noticesApi';
import { Button } from '@/components/ui/button';

export default function NoticesPage() {
  const [notices, setNotices] = useState<NoticeSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [retry, setRetry] = useState<number>(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    void fetchNotices(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setNotices(items);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setError(error instanceof Error ? error.message : '공지를 불러오지 못했어요.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [retry]);

  return (
    <>
      <p className="text-xs font-bold tracking-wider text-primary">그로우두 소식</p>
      <h1 className="friendly-heading mt-3 text-4xl font-bold tracking-tight">
        함께 알아둘 이야기
      </h1>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        새로운 기능과 이용 안내를 전해드려요.
      </p>
      <div className="mt-10 border-t border-border">
        {loading ? (
          <p role="status" className="py-10 text-muted-foreground">
            소식을 불러오는 중이에요.
          </p>
        ) : error ? (
          <div role="alert" className="py-10">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setRetry((value) => value + 1)}
            >
              다시 시도
            </Button>
          </div>
        ) : notices.length === 0 ? (
          <p className="py-12 text-muted-foreground">아직 전해드릴 소식이 없어요.</p>
        ) : (
          <ul className="divide-y divide-border">
            {notices.map((notice) => (
              <li key={notice.id}>
                <Link
                  href={`/notice/${notice.id}`}
                  className="group flex items-center gap-4 py-6 hover:text-primary"
                >
                  <div className="min-w-0 flex-1">
                    <time dateTime={notice.createdAt} className="text-xs text-muted-foreground">
                      {formatNoticeDate(notice.createdAt)}
                    </time>
                    <h2 className="mt-2 break-words text-lg font-semibold [overflow-wrap:anywhere]">
                      {notice.title}
                    </h2>
                  </div>
                  <ArrowUpRight className="size-5 shrink-0 text-muted-foreground group-hover:text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
