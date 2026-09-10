'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { BellRing, Clock3 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  fetchNotificationSettings,
  updateNotificationSettings,
  type NotificationSettings,
} from '@/app/lib/notificationSettingsApi';

const DEFAULT_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  dailyReminderTime: '09:00',
  timezone: 'Asia/Seoul',
};

function currentTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Seoul';
}

export default function NotificationSettingsForm() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const loaded = await fetchNotificationSettings();
      setSettings(loaded);
      setSavedSettings(loaded);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '알림 설정을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const isDirty = useMemo(
    () =>
      savedSettings !== null &&
      (settings.pushEnabled !== savedSettings.pushEnabled ||
        settings.dailyReminderTime !== savedSettings.dailyReminderTime),
    [savedSettings, settings]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const updated = await updateNotificationSettings({
        pushEnabled: settings.pushEnabled,
        dailyReminderTime: settings.dailyReminderTime,
        timezone: currentTimezone(),
      });
      setSettings(updated);
      setSavedSettings(updated);
      toast.success(
        updated.pushEnabled
          ? `매일 ${updated.dailyReminderTime}에 알려드릴게요.`
          : 'GrowDo 알림을 껐어요.'
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '알림 설정을 저장하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mt-12 border-t border-stone-200/80 pt-10 dark:border-white/10">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#dfeadd] text-[#267345] dark:bg-primary/15 dark:text-primary">
          <BellRing className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="journal-kicker mb-1">REMINDER</p>
          <h2 className="friendly-heading text-2xl font-bold tracking-[-0.045em] text-foreground sm:text-3xl">
            필요한 때에만 가볍게 알려드려요
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            오늘 할 일을 놓치지 않도록 원하는 시간에 한 번 알려드릴게요.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-7 h-40 animate-pulse rounded-[1.5rem] bg-[#eef0e7] dark:bg-muted" />
      ) : errorMessage && savedSettings === null ? (
        <div className="mt-7 border-y border-border py-6">
          <p role="alert" className="text-sm font-semibold text-destructive">
            {errorMessage}
          </p>
          <Button type="button" variant="outline" className="mt-4 rounded-full" onClick={loadSettings}>
            다시 불러오기
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div className="flex min-h-20 items-center justify-between gap-5 rounded-[1.5rem] bg-[#eef0e7] px-5 py-4 dark:bg-muted sm:px-6">
            <Label htmlFor="push-enabled" className="cursor-pointer">
              <span className="block text-sm font-bold text-foreground">알림 받기</span>
              <span className="mt-1 block text-xs font-normal leading-5 text-muted-foreground">
                GrowDo의 일일 할 일 리마인더를 받아요.
              </span>
            </Label>
            <Switch
              id="push-enabled"
              checked={settings.pushEnabled}
              onCheckedChange={(pushEnabled) => setSettings((current) => ({ ...current, pushEnabled }))}
              aria-describedby="push-enabled-description"
              className="h-7 w-12 [&_[data-slot=switch-thumb]]:size-6"
            />
          </div>

          <div
            className={`grid gap-4 border-b border-border pb-6 transition-opacity sm:grid-cols-[1fr_11rem] sm:items-end ${
              settings.pushEnabled ? 'opacity-100' : 'opacity-45'
            }`}
          >
            <div className="flex gap-3">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#3f7652] dark:text-primary" aria-hidden="true" />
              <div>
                <Label htmlFor="daily-reminder-time" className="text-sm font-bold">
                  매일 알림 시간
                </Label>
                <p id="push-enabled-description" className="mt-1 text-xs leading-5 text-muted-foreground">
                  현재 기기의 시간대를 기준으로 발송해요.
                </p>
              </div>
            </div>
            <Input
              id="daily-reminder-time"
              type="time"
              value={settings.dailyReminderTime}
              disabled={!settings.pushEnabled}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  dailyReminderTime: event.target.value,
                }))
              }
              className="h-12 rounded-xl bg-card text-base font-bold"
            />
          </div>

          {errorMessage ? (
            <p role="alert" className="text-sm font-semibold text-destructive">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isDirty || isSaving}
              className="min-h-11 min-w-32 rounded-full px-6"
            >
              {isSaving ? '저장 중...' : '알림 설정 저장'}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
