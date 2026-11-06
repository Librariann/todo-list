'use client';

import { ChevronDown, Disc3, Moon, Palette, Waves, type LucideIcon } from 'lucide-react';
import { isTodayTheme, TodayTheme } from '@/app/hooks/useTodayTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TodayThemePickerProps {
  theme: TodayTheme;
  onThemeChange: (theme: TodayTheme) => void;
}

const themeOptions: Record<
  TodayTheme,
  { label: string; description: string; icon: LucideIcon; swatch: string; button: string }
> = {
  [TodayTheme.Default]: {
    label: '기본',
    description: '그로우두의 원래 화면',
    icon: Palette,
    swatch: 'bg-[#e5efdf] text-[#3a6147]',
    button:
      'rounded-full border-border bg-card text-foreground hover:bg-secondary focus-visible:outline-ring',
  },
  [TodayTheme.Night]: {
    label: '밤하늘',
    description: '달의 궤도를 담은 관측 일지',
    icon: Moon,
    swatch: 'bg-[#19283f] text-[#f0d7a8]',
    button:
      'rounded-md border-[#8b795a] bg-[#253442] text-[#f8e8c9] hover:bg-[#394653] focus-visible:outline-[#edcf94]',
  },
  [TodayTheme.Coast]: {
    label: '해안 산책',
    description: '파도 옆에서 이어가는 기록',
    icon: Waves,
    swatch: 'bg-[#d9eff1] text-[#155d67]',
    button:
      'rounded-full border-[#86b4b9] bg-[#f1faf7] text-[#1a4c56] hover:bg-[#dceff0] focus-visible:outline-[#206573]',
  },
  [TodayTheme.Studio]: {
    label: '리듬 스튜디오',
    description: '한 트랙씩 채우는 오늘',
    icon: Disc3,
    swatch: 'bg-[#f5cf6a] text-[#31272a]',
    button:
      'rounded-none border-[#31272a] bg-[#31272a] text-[#fff3d4] hover:bg-[#513f43] focus-visible:outline-[#31272a]',
  },
};

export default function TodayThemePicker({ theme, onThemeChange }: TodayThemePickerProps) {
  const selected = themeOptions[theme];
  const SelectedIcon = selected.icon;

  const handleThemeChange = (value: string) => {
    if (isTodayTheme(value)) onThemeChange(value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`화면 테마: ${selected.label}`}
          className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 border px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${selected.button}`}
        >
          <SelectedIcon aria-hidden="true" className="size-4" />
          {theme === TodayTheme.Default ? '테마' : selected.label}
          <ChevronDown aria-hidden="true" className="size-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-60 rounded-2xl p-2 motion-reduce:animate-none"
      >
        <DropdownMenuLabel className="pb-2 text-xs font-semibold text-muted-foreground">
          오늘 화면 꾸미기
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
          {Object.values(TodayTheme).map((value) => {
            const option = themeOptions[value];
            const Icon = option.icon;
            return (
              <DropdownMenuRadioItem
                key={value}
                value={value}
                className="min-h-12 cursor-pointer gap-3 rounded-lg"
              >
                <span
                  aria-hidden="true"
                  className={`grid size-7 shrink-0 place-items-center rounded-md ${option.swatch}`}
                >
                  <Icon className="size-3.5" />
                </span>
                <span className="grid gap-0.5">
                  <span className="font-semibold">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </span>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
