'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchNotice, formatNoticeDate, type Notice } from '@/app/lib/noticesApi';
import { Button } from '@/components/ui/button';

export default function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [retry, setRetry] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setNotice(null);
    void fetchNotice(id, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setNotice(result);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setError(error instanceof Error ? error.message : '공지를 불러오지 못했어요.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, retry]);

  return (
    <>
      <Link
        href="/notice"
        className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
      >
        ← 공지사항 전체 보기
      </Link>
      {loading ? (
        <p role="status" className="py-12 text-muted-foreground">
          소식을 불러오는 중이에요.
        </p>
      ) : error ? (
        <div role="alert" className="py-12">
          <h1 className="text-xl font-bold">소식을 확인할 수 없어요.</h1>
          <p className="mt-3 text-sm text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            className="mt-5 min-h-11"
            onClick={() => setRetry((value) => value + 1)}
          >
            다시 시도
          </Button>
        </div>
      ) : (
        notice && (
          <article className="mt-5">
            <header className="border-b border-border pb-7">
              <p className="text-xs font-bold tracking-wider text-primary">그로우두 소식</p>
              <h1 className="friendly-heading mt-4 break-words text-3xl font-bold leading-snug tracking-tight [overflow-wrap:anywhere] sm:text-4xl">
                {notice.title}
              </h1>
              <time
                dateTime={notice.createdAt}
                className="mt-5 block text-sm text-muted-foreground"
              >
                {formatNoticeDate(notice.createdAt)}
              </time>
            </header>
            <div className="whitespace-pre-wrap break-words py-8 text-base leading-8 [overflow-wrap:anywhere]">
              {notice.content}
            </div>
          </article>
        )
      )}
    </>
  );
}
