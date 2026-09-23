'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  Eye,
  EyeOff,
  FileImage,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createRewardCoupon,
  fetchRewardCoupons,
  type RewardCouponInventoryItem,
  type RewardCouponStatus,
  updateRewardCouponStatus,
} from '@/app/lib/rewardCouponsApi';
import type { Reward } from './types';

interface RewardCouponInventoryProps {
  reward: Reward;
  onClose: () => void;
  onInventoryChanged: () => void;
}

interface UploadRow {
  id: string;
  file: File;
  pinCode: string;
  error: string | null;
}

const MAX_FILES = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const inventoryDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const statusLabel: Record<RewardCouponStatus, string> = {
  AVAILABLE: '교환 가능',
  ASSIGNED: '발급 완료',
  USED: '사용 완료',
  DISABLED: '사용 중지',
  EXPIRED: '기간 만료',
};

const statusClass: Record<RewardCouponStatus, string> = {
  AVAILABLE: 'bg-primary/10 text-primary',
  ASSIGNED: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200',
  USED: 'bg-stone-100 text-stone-600 dark:bg-white/5 dark:text-stone-300',
  DISABLED: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  EXPIRED: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200',
};

function createRow(file: File): UploadRow {
  return {
    id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
    file,
    pinCode: '',
    error: null,
  };
}

function todayDateInput(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function formatDate(value: string): string {
  return inventoryDateFormatter.format(new Date(value));
}

function CouponFilePreview({ file, index }: { file: File; index: number }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <span className="relative block h-12 w-12 overflow-hidden rounded-xl bg-muted">
      {previewUrl ? (
        // 로컬에서 고른 파일만 미리보고 외부 주소로 전송하지 않는다.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="" className="h-full w-full object-cover" />
      ) : null}
      <span className="absolute bottom-0 right-0 flex h-5 min-w-5 items-center justify-center rounded-tl-lg bg-foreground/80 px-1 text-[10px] font-bold text-background">
        {index}
      </span>
    </span>
  );
}

export default function RewardCouponInventory({
  reward,
  onClose,
  onInventoryChanged,
}: RewardCouponInventoryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<RewardCouponInventoryItem[]>([]);
  const [rows, setRows] = useState<UploadRow[]>([]);
  const [providerOrderNumber, setProviderOrderNumber] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setItems(await fetchRewardCoupons(reward.id));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : '쿠폰 재고를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, [reward.id]);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  const counts = useMemo(
    () => ({
      available: items.filter((item) => item.status === 'AVAILABLE').length,
      issued: items.filter((item) => item.status === 'ASSIGNED' || item.status === 'USED').length,
      unavailable: items.filter(
        (item) => item.status === 'DISABLED' || item.status === 'EXPIRED'
      ).length,
    }),
    [items]
  );

  function handleFiles(files: FileList | null) {
    if (!files) return;

    const availableSlots = MAX_FILES - rows.length;
    const selected = Array.from(files).slice(0, availableSlots);
    const valid: File[] = [];

    selected.forEach((file) => {
      if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
        toast.error(`${file.name}: JPG, PNG, WebP 이미지만 등록할 수 있어요.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: 이미지 크기는 10MB 이하여야 해요.`);
        return;
      }
      valid.push(file);
    });

    if (files.length > availableSlots) {
      toast.error(`한 번에 최대 ${MAX_FILES}장까지 등록할 수 있어요.`);
    }
    setRows((current) => [...current, ...valid.map(createRow)]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function updatePin(id: string, pinCode: string) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, pinCode, error: null } : row))
    );
  }

  function removeRow(id: string) {
    if (submitting) return;
    setRows((current) => current.filter((row) => row.id !== id));
  }

  async function handleSubmit() {
    const normalizedPins = rows.map((row) => row.pinCode.replace(/[\s-]/g, '').toUpperCase());
    const duplicatePins = new Set(
      normalizedPins.filter((pin, index) => pin && normalizedPins.indexOf(pin) !== index)
    );
    const invalidRows = rows.map((row, index) => ({
      ...row,
      error: !row.pinCode.trim()
        ? 'PIN 번호를 입력해 주세요.'
        : duplicatePins.has(normalizedPins[index])
          ? '같은 PIN 번호가 두 번 입력됐어요.'
          : null,
    }));

    if (!rows.length) {
      toast.error('등록할 쿠폰 이미지를 먼저 선택해 주세요.');
      return;
    }
    if (!expiresAt) {
      toast.error('쿠폰 유효기간을 입력해 주세요.');
      return;
    }
    if (expiresAt < todayDateInput()) {
      toast.error('오늘 이후의 유효기간을 입력해 주세요.');
      return;
    }
    if (invalidRows.some((row) => row.error)) {
      setRows(invalidRows);
      toast.error('PIN 번호를 확인해 주세요.');
      return;
    }

    setSubmitting(true);
    let successCount = 0;
    const failedRows: UploadRow[] = [];

    for (const row of invalidRows) {
      try {
        await createRewardCoupon({
          rewardId: reward.id,
          pinCode: row.pinCode,
          expiresAt: new Date(`${expiresAt}T23:59:59+09:00`).toISOString(),
          providerOrderNumber,
          image: row.file,
        });
        successCount += 1;
      } catch (error) {
        failedRows.push({
          ...row,
          error: error instanceof Error ? error.message : '등록하지 못했어요.',
        });
      }
    }

    setRows(failedRows);
    if (successCount > 0) {
      toast.success(`${successCount}장의 쿠폰을 안전하게 등록했어요.`);
      await loadInventory();
      onInventoryChanged();
    }
    if (failedRows.length > 0) {
      toast.error(`${failedRows.length}장은 등록하지 못했어요. 내용을 확인해 주세요.`);
    } else {
      setProviderOrderNumber('');
      setExpiresAt('');
    }
    setSubmitting(false);
  }

  async function handleStatusToggle(item: RewardCouponInventoryItem) {
    if (item.status !== 'AVAILABLE' && item.status !== 'DISABLED') return;
    const nextStatus = item.status === 'AVAILABLE' ? 'DISABLED' : 'AVAILABLE';
    setTogglingId(item.id);
    try {
      const updated = await updateRewardCouponStatus(reward.id, item.id, nextStatus);
      setItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
      onInventoryChanged();
      toast.success(nextStatus === 'AVAILABLE' ? '쿠폰을 다시 열었어요.' : '쿠폰을 잠시 막았어요.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '쿠폰 상태를 변경하지 못했어요.');
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <section className="space-y-5" aria-labelledby="coupon-inventory-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={onClose}
            className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            보상 목록
          </button>
          <p className="text-xs font-bold tracking-[0.18em] text-primary">COUPON INVENTORY</p>
          <h2 id="coupon-inventory-title" className="friendly-heading mt-1 text-2xl font-bold">
            {reward.name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            상품 이미지와 실제 쿠폰 이미지는 분리돼요. 아래 이미지는 발급받은 사용자만 볼 수 있어요.
          </p>
        </div>
        <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border bg-card text-center">
          {[
            ['교환 가능', counts.available],
            ['발급 완료', counts.issued],
            ['이용 불가', counts.unavailable],
          ].map(([label, count]) => (
            <div key={label} className="min-w-20 border-r border-border px-3 py-3 last:border-r-0">
              <strong className="block text-lg text-foreground">{count}</strong>
              <span className="text-[11px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
        <div className="rounded-3xl bg-[#edf4e9] p-5 dark:bg-[oklch(0.24_0.025_145)] sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h3 className="font-bold">새 쿠폰 묶음 등록</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                기프티쇼에서 받은 이미지들을 고른 뒤, 각 이미지에 맞는 PIN을 입력해 주세요.
                등록 중 성공한 쿠폰은 다시 전송하지 않아요.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              주문번호 <span className="font-normal text-muted-foreground">(선택)</span>
              <input
                className="input-common mt-2"
                value={providerOrderNumber}
                onChange={(event) => setProviderOrderNumber(event.target.value)}
                maxLength={100}
                placeholder="기프티쇼 주문번호"
                disabled={submitting}
              />
            </label>
            <label className="text-sm font-semibold">
              유효기간 *
              <input
                className="input-common mt-2"
                type="date"
                min={todayDateInput()}
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
                disabled={submitting}
              />
            </label>
          </div>

          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => handleFiles(event.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting || rows.length >= MAX_FILES}
            className="mt-4 flex min-h-24 w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/35 bg-card/70 px-4 text-sm font-bold text-primary transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="h-5 w-5" />
            쿠폰 이미지 여러 장 선택
            <span className="font-normal text-muted-foreground">({rows.length}/{MAX_FILES})</span>
          </button>

          {rows.length > 0 ? (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">
                  파일 이름과 PIN을 한 번 더 맞춰봐 주세요.
                </p>
                <button
                  type="button"
                  onClick={() => setShowPins((value) => !value)}
                  className="inline-flex min-h-10 items-center gap-1.5 px-2 text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  {showPins ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPins ? 'PIN 가리기' : 'PIN 확인'}
                </button>
              </div>
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  className="grid min-w-0 gap-2 rounded-2xl bg-card p-3 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(10rem,0.9fr)_2.75rem] sm:items-start"
                >
                  <CouponFilePreview file={row.file} index={index + 1} />
                  <div className="min-w-0 py-1">
                    <p className="truncate text-sm font-semibold" title={row.file.name}>
                      {row.file.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {(row.file.size / 1024 / 1024).toFixed(1)}MB
                    </p>
                  </div>
                  <div>
                    <input
                      type={showPins ? 'text' : 'password'}
                      value={row.pinCode}
                      onChange={(event) => updatePin(row.id, event.target.value)}
                      className="input-common font-mono tracking-[0.08em]"
                      placeholder="PIN 번호"
                      maxLength={100}
                      autoComplete="off"
                      spellCheck={false}
                      disabled={submitting}
                      aria-label={`${row.file.name} PIN 번호`}
                      aria-invalid={Boolean(row.error)}
                    />
                    {row.error ? (
                      <p className="mt-1 text-xs text-destructive" role="alert">
                        {row.error}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={submitting}
                    aria-label={`${row.file.name} 제외`}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting || rows.length === 0}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
          >
            {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
            {submitting ? '쿠폰을 안전하게 등록하는 중...' : `${rows.length}장 등록하기`}
          </button>
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold">등록 내역</h3>
            <button
              type="button"
              onClick={() => void loadInventory()}
              disabled={loading}
              className="flex min-h-10 items-center gap-1.5 px-2 text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm">
              <div className="flex gap-2 text-destructive">
                <CircleAlert className="h-4 w-4 shrink-0" />
                <p>{loadError}</p>
              </div>
              <button
                type="button"
                onClick={() => void loadInventory()}
                className="mt-3 min-h-10 rounded-lg border border-border px-3 font-semibold"
              >
                다시 시도
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border px-6 py-12 text-center">
              <FileImage className="mx-auto h-7 w-7 text-muted-foreground" />
              <p className="mt-3 font-bold">아직 등록한 쿠폰이 없어요</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                왼쪽에서 이미지와 PIN을 함께 등록하면 이곳에 안전 상태만 표시돼요.
              </p>
            </div>
          ) : (
            <div className="max-h-[42rem] space-y-2 overflow-y-auto pr-1">
              {items.map((item) => (
                <article key={item.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${statusClass[item.status]}`}>
                          {statusLabel[item.status]}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {item.maskedPin}
                        </span>
                      </div>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(item.expiresAt)}까지
                      </p>
                      {item.providerOrderNumber ? (
                        <p className="mt-1 truncate text-[11px] text-muted-foreground">
                          주문 {item.providerOrderNumber}
                        </p>
                      ) : null}
                    </div>
                    {item.status === 'AVAILABLE' || item.status === 'DISABLED' ? (
                      <button
                        type="button"
                        onClick={() => void handleStatusToggle(item)}
                        disabled={togglingId === item.id}
                        className="min-h-10 shrink-0 rounded-xl border border-border px-3 text-xs font-bold transition-colors hover:bg-muted disabled:opacity-40"
                      >
                        {togglingId === item.id
                          ? '변경 중...'
                          : item.status === 'AVAILABLE'
                            ? '사용 중지'
                            : '다시 열기'}
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
