'use client';

import Link from 'next/link';
import { ArrowUpRight, ChevronDown, Disc3, Moon, Palette, Store, Waves, type LucideIcon } from 'lucide-react';
import { isTodayTheme, TodayTheme } from '@/app/hooks/useTodayTheme';
import { themeCatalog } from '@/app/lib/themeCatalog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
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
    ...themeCatalog[TodayTheme.Night],
    icon: Moon,
    button:
      'rounded-md border-[#8b795a] bg-[#253442] text-[#f8e8c9] hover:bg-[#394653] focus-visible:outline-[#edcf94]',
  },
  [TodayTheme.Coast]: {
    ...themeCatalog[TodayTheme.Coast],
    icon: Waves,
    button:
      'rounded-full border-[#86b4b9] bg-[#f1faf7] text-[#1a4c56] hover:bg-[#dceff0] focus-visible:outline-[#206573]',
  },
  [TodayTheme.Studio]: {
    ...themeCatalog[TodayTheme.Studio],
    icon: Disc3,
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
        <DropdownMenuItem asChild className="min-h-11 cursor-pointer gap-2 rounded-lg bg-secondary font-semibold text-foreground">
          <Link href="/themes">
            <Store aria-hidden="true" />
            테마 상점 둘러보기
            <ArrowUpRight aria-hidden="true" className="ml-auto" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="pb-2 text-xs font-semibold text-muted-foreground">
          화면 테마 바꾸기
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
