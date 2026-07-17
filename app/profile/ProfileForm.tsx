'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getNicknameWeight,
  isNicknameValid,
  NICKNAME_MAX_WEIGHT,
  NICKNAME_PATTERN,
} from '@/app/lib/nickname';
import {
  checkNicknameAvailability,
  type UpdateUserProfileInput,
  type UserProfile,
} from '@/app/lib/usersApi';

type NicknameAvailability = 'idle' | 'checking' | 'available' | 'unavailable' | 'error';

interface ProfileFormProps {
  profile: UserProfile;
  onSubmit: (input: UpdateUserProfileInput) => Promise<void>;
}

export default function ProfileForm({ profile, onSubmit }: ProfileFormProps) {
  const [nickname, setNickname] = useState(profile.nickname);
  const [name, setName] = useState(profile.name ?? '');
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [nicknameAvailability, setNicknameAvailability] =
    useState<NicknameAvailability>('available');
  const trimmedNickname = nickname.trim();
  const nicknameWeight = getNicknameWeight(nickname.trim());

  useEffect(() => {
    if (!isNicknameValid(trimmedNickname)) {
      return;
    }

    if (trimmedNickname === profile.nickname) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const available = await checkNicknameAvailability(
          trimmedNickname,
          controller.signal
        );
        setNicknameAvailability(available ? 'available' : 'unavailable');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setNicknameAvailability('error');
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [profile.nickname, trimmedNickname]);

  const handleNicknameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextNickname = event.target.value;
    const nextTrimmedNickname = nextNickname.trim();

    setNickname(nextNickname);
    setValidationMessage(null);

    if (!isNicknameValid(nextTrimmedNickname)) {
      setNicknameAvailability('idle');
    } else if (nextTrimmedNickname === profile.nickname) {
      setNicknameAvailability('available');
    } else {
      setNicknameAvailability('checking');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (trimmedNickname.length < 2) {
      setValidationMessage('닉네임은 두 글자 이상 입력해주세요.');
      return;
    }

    if (!NICKNAME_PATTERN.test(trimmedNickname)) {
      setValidationMessage('닉네임은 한글, 영문, 숫자와 밑줄만 사용할 수 있어요.');
      return;
    }

    if (nicknameAvailability === 'checking') {
      setValidationMessage('닉네임 중복 확인이 끝날 때까지 잠시 기다려주세요.');
      return;
    }

    if (nicknameAvailability === 'unavailable') {
      setValidationMessage('이미 사용 중인 닉네임이에요.');
      return;
    }

    if (getNicknameWeight(trimmedNickname) > NICKNAME_MAX_WEIGHT) {
      setValidationMessage(
        '닉네임은 한글 6자 또는 영문·숫자·밑줄 12자 이내로 입력해주세요.'
      );
      return;
    }

    setValidationMessage(null);
    setIsSaving(true);
    try {
      await onSubmit({
        nickname: trimmedNickname,
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      setNickname(trimmedNickname);
    } catch (error) {
      setValidationMessage(
        error instanceof Error ? error.message : '내 정보를 저장하지 못했습니다.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <p className="journal-kicker mb-2">PROFILE</p>
        <h1 className="friendly-heading text-4xl font-bold tracking-[-0.055em] text-foreground sm:text-5xl">
          나답게 불릴 이름을 정해요
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          매일 마주치는 이름과 기본 정보를 편하게 관리할 수 있어요.
        </p>
      </div>

      <div className="h-px bg-border" />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="nickname" className="mb-2 block text-sm font-bold">
            닉네임
          </Label>
          <Input
            id="nickname"
            value={nickname}
            onChange={handleNicknameChange}
            minLength={2}
            maxLength={12}
            autoComplete="nickname"
            aria-describedby="nickname-help"
            aria-invalid={
              nicknameWeight > NICKNAME_MAX_WEIGHT ||
              nicknameAvailability === 'unavailable'
            }
          />
          <p
            id="nickname-help"
            className={`mt-2 text-xs leading-5 ${
              nicknameWeight > NICKNAME_MAX_WEIGHT
                ? 'font-semibold text-destructive'
                : 'text-muted-foreground'
            }`}
          >
            한글 최대 6자, 영문·숫자·밑줄 최대 12자까지 사용할 수 있어요. (
            {nicknameWeight}/{NICKNAME_MAX_WEIGHT})
          </p>
          <p
            role="status"
            aria-live="polite"
            className={`mt-1 min-h-5 text-xs font-semibold ${
              nicknameAvailability === 'available'
                ? 'text-[#25834b] dark:text-[#68d391]'
                : nicknameAvailability === 'unavailable'
                  ? 'text-destructive'
                  : 'text-muted-foreground'
            }`}
          >
            {nicknameAvailability === 'checking'
              ? '닉네임을 확인하고 있어요...'
              : nicknameAvailability === 'available'
                ? '사용할 수 있는 닉네임이에요.'
                : nicknameAvailability === 'unavailable'
                  ? '이미 사용 중인 닉네임이에요.'
                  : nicknameAvailability === 'error'
                    ? '지금은 중복 여부를 확인할 수 없어요.'
                    : trimmedNickname.length > 0 && trimmedNickname.length < 2
                      ? '닉네임을 두 글자 이상 입력해주세요.'
                      : nicknameWeight > NICKNAME_MAX_WEIGHT
                        ? '닉네임 길이를 조금 줄여주세요.'
                        : trimmedNickname.length >= 2 &&
                            !NICKNAME_PATTERN.test(trimmedNickname)
                          ? '한글, 영문, 숫자와 밑줄만 사용할 수 있어요.'
                      : ''}
          </p>
        </div>

        <div>
          <Label htmlFor="name" className="mb-2 block text-sm font-bold">
            이름
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={50}
            autoComplete="name"
            placeholder="선택 입력"
          />
        </div>

        <div>
          <Label htmlFor="phoneNumber" className="mb-2 block text-sm font-bold">
            연락처
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            maxLength={20}
            autoComplete="tel"
            placeholder="선택 입력"
          />
        </div>
      </div>

      <div className="rounded-[1.4rem] bg-[#eef0e7] px-5 py-4 dark:bg-muted">
        <p className="text-xs font-bold tracking-[0.12em] text-muted-foreground">로그인 이메일</p>
        <p className="mt-2 break-all text-sm font-semibold text-foreground">{profile.email}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          로그인에 사용하는 이메일은 현재 화면에서 변경할 수 없어요.
        </p>
      </div>

      {validationMessage ? (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {validationMessage}
        </p>
      ) : null}

      <div className="flex justify-end border-t border-border pt-6">
        <Button
          type="submit"
          disabled={
            isSaving ||
            nicknameAvailability === 'checking' ||
            nicknameAvailability === 'unavailable'
          }
          className="min-h-12 min-w-36 rounded-full px-6"
        >
          {isSaving ? '저장 중...' : '변경사항 저장'}
        </Button>
      </div>
    </form>
  );
}
