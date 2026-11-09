import { TodayTheme } from '@/app/hooks/useTodayTheme';

export const shopThemes = [TodayTheme.Night, TodayTheme.Coast, TodayTheme.Studio] as const;

export type ShopTheme = (typeof shopThemes)[number];

export const themeCatalog: Record<ShopTheme, { label: string; description: string; swatch: string }> = {
  [TodayTheme.Night]: {
    label: '밤하늘',
    description: '달의 궤도를 담은 관측 일지',
    swatch: 'bg-[#19283f] text-[#f0d7a8]',
  },
  [TodayTheme.Coast]: {
    label: '해안 산책',
    description: '파도 옆에서 이어가는 기록',
    swatch: 'bg-[#d9eff1] text-[#155d67]',
  },
  [TodayTheme.Studio]: {
    label: '리듬 스튜디오',
    description: '한 트랙씩 채우는 오늘',
    swatch: 'bg-[#f5cf6a] text-[#31272a]',
  },
};
