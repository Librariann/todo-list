'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Plus, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  deleteNotice,
  fetchAdminNotices,
  formatNoticeDate,
  saveNotice,
  type Notice,
  type NoticeInput,
} from '@/app/lib/noticesApi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const EMPTY_NOTICE: NoticeInput = { title: '', content: '', isPublished: false };

export default function NoticesTab() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');
  const [reload, setReload] = useState<number>(0);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [form, setForm] = useState<NoticeInput>(EMPTY_NOTICE);
  const [savedForm, setSavedForm] = useState<NoticeInput>(EMPTY_NOTICE);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);
  const editorRef = useRef<HTMLFormElement>(null);
  const dirty = JSON.stringify(form) !== JSON.stringify(savedForm);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    void fetchAdminNotices(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setNotices(items);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setLoadError(error instanceof Error ? error.message : '공지를 불러오지 못했어요.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reload]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const handleSelect = (notice?: Notice) => {
    if (dirty && !window.confirm('저장하지 않은 내용을 버리고 이동할까요?')) return;
    const input = notice
      ? { title: notice.title, content: notice.content, isPublished: notice.isPublished }
      : EMPTY_NOTICE;
    setEditingId(notice?.id);
    setForm(input);
    setSavedForm(input);
    setSaveError('');
    editorRef.current?.scrollIntoView({ block: 'nearest' });
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (saving) return;
    const input = { ...form, title: form.title.trim(), content: form.content.trim() };
    if (!input.title || !input.content) {
      setSaveError('제목과 내용을 모두 입력해 주세요.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const result = await saveNotice(input, editingId);
      setNotices((items) =>
        [result, ...items.filter((item) => item.id !== result.id)].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ||
            Number(b.id) - Number(a.id)
        )
      );
      setEditingId(result.id);
      setForm(input);
      setSavedForm(input);
      toast.success(input.isPublished ? '공지를 게시했어요.' : '공지를 임시저장했어요.');
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : '저장하지 못했어요. 다시 시도해 주세요.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section aria-label="공지사항 관리" className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">공지사항</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            게시한 공지는 사용자 화면 상단에서 최신 등록 순으로 돌아가요.
            <br />
            게시 중인 공지가 없으면 공지 영역은 보이지 않아요.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => handleSelect()}
          disabled={saving}
          className="min-h-11"
        >
          <Plus className="size-4" />새 공지
        </Button>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="min-w-0">
          {loading ? (
            <p role="status" className="py-8 text-sm text-muted-foreground">
              공지를 불러오는 중이에요.
            </p>
          ) : loadError ? (
            <div role="alert" className="py-6">
              <p className="text-sm text-destructive">{loadError}</p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => setReload((value) => value + 1)}
              >
                다시 시도
              </Button>
            </div>
          ) : notices.length === 0 ? (
            <div className="border-y border-dashed border-border py-10">
              <p className="font-semibold">아직 등록한 공지가 없어요.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                첫 소식을 작성하고 게시해 보세요.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {notices.map((notice) => (
                <li key={notice.id}>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSelect(notice)}
                    aria-pressed={editingId === notice.id}
                    className={`w-full rounded-sm px-3 py-5 text-left transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring ${editingId === notice.id ? 'bg-primary/5' : ''}`}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={
                          notice.isPublished ? 'font-bold text-primary' : 'text-muted-foreground'
                        }
                      >
                        {notice.isPublished ? '게시 중' : '임시저장'}
                      </span>
                      <span className="text-muted-foreground">
                        {formatNoticeDate(notice.createdAt)}
                      </span>
                    </div>
                    <p className="break-words font-semibold [overflow-wrap:anywhere]">
                      {notice.title}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <form
          ref={editorRef}
          onSubmit={(event) => void handleSave(event)}
          className="min-w-0 space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6"
        >
          <h3 className="font-bold">{editingId === undefined ? '새 소식 작성' : '공지 수정'}</h3>
          <fieldset disabled={saving} className="min-w-0 space-y-5">
            <div>
              <label htmlFor="notice-title" className="text-sm font-semibold">
                제목
              </label>
              <Input
                id="notice-title"
                required
                maxLength={100}
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="사용자에게 전할 소식의 제목"
                className="mt-2 min-h-11"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {form.title.length}/100
              </p>
            </div>
            <div>
              <label htmlFor="notice-content" className="text-sm font-semibold">
                내용
              </label>
              <textarea
                id="notice-content"
                required
                maxLength={10000}
                rows={12}
                value={form.content}
                onChange={(event) => setForm({ ...form, content: event.target.value })}
                placeholder="변경 사항이나 알아두면 좋은 소식을 적어주세요."
                className="mt-2 w-full resize-y rounded-md border border-input bg-transparent px-3 py-3 text-base leading-7 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                줄바꿈은 그대로 표시돼요. HTML이나 마크다운은 적용되지 않아요.
              </p>
            </div>
            <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl bg-muted/60 p-4">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) => setForm({ ...form, isPublished: event.target.checked })}
                className="mt-1 size-4 accent-primary"
              />
              <span>
                <span className="text-sm font-semibold">사용자에게 게시</span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  체크한 뒤 저장하면 바로 공개돼요. 해제하고 저장하면 목록과 상세 페이지에서
                  숨겨져요.
                </span>
              </span>
            </label>
          </fieldset>
          {saveError && (
            <p role="alert" className="text-sm text-destructive">
              {saveError}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <div className="flex items-center gap-2">
              {editingId !== undefined && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={saving}
                  className="min-h-11 text-destructive hover:text-destructive"
                  onClick={() =>
                    setDeleteTarget(notices.find((item) => item.id === editingId) ?? null)
                  }
                >
                  삭제
                </Button>
              )}
              {editingId !== undefined &&
                notices.find((item) => item.id === editingId)?.isPublished && (
                  <Link
                    href={`/notice/${editingId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    게시글 보기
                    <ArrowUpRight className="size-4" />
                  </Link>
                )}
            </div>
            <Button type="submit" disabled={saving} className="min-h-11">
              {saving ? '저장하는 중…' : form.isPublished ? '게시하고 저장' : '임시저장'}
            </Button>
          </div>
        </form>
      </div>
      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="공지를 삭제할까요?"
        description="삭제하면 사용자 화면에서도 더 이상 볼 수 없어요."
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteNotice(deleteTarget.id);
          setNotices((items) => items.filter((item) => item.id !== deleteTarget.id));
          if (editingId === deleteTarget.id) {
            setEditingId(undefined);
            setForm(EMPTY_NOTICE);
            setSavedForm(EMPTY_NOTICE);
            setSaveError('');
          }
          toast.success('공지를 삭제했어요.');
        }}
      />
    </section>
  );
}
