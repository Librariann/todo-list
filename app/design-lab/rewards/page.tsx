'use client';

import Link from 'next/link';
import RewardShop from '@/app/components/RewardShop';
import { Reward, RewardType } from '@/app/types/todo';

const previewRewards: Reward[] = [
  {
    id: 'preview-coffee',
    type: RewardType.COFFEE_COUPON,
    name: '아이스 카페 아메리카노 T',
    description: '꾸준히 쌓은 하루를 시원한 한 잔으로 바꿔보세요.',
    value: 4700,
    discount: true,
    discountRate: 15,
    imageUrl: null,
    availableFrom: null,
    exchangeEnabled: true,
    stockQuantity: 2,
  },
  {
    id: 'preview-coming-soon',
    type: RewardType.COFFEE_COUPON,
    name: '달콤한 오후의 디저트',
    description: '조금 더 모은 뒤 만날 수 있는 다음 작은 보상이에요.',
    value: 6200,
    discount: false,
    discountRate: 0,
    imageUrl: null,
    availableFrom: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    exchangeEnabled: true,
    stockQuantity: 10,
  },
];

export default function RewardDesignPreviewPage() {
  return (
    <main className="min-h-screen bg-[#d9e1d5] px-3 py-5 dark:bg-background sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#fbf8ef] shadow-[0_24px_70px_rgba(38,48,42,0.14)] dark:bg-card">
        <header className="flex items-center justify-between border-b border-[#d9e1d6] px-5 py-4 dark:border-border sm:px-8">
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#66806f]">DESIGN LAB</p>
            <p className="friendly-heading mt-1 font-bold">보상 선반 미리보기</p>
          </div>
          <Link
            href="/design-lab"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            시안 목록으로
          </Link>
        </header>
        <RewardShop previewRewards={previewRewards} previewPoints={5900} previewOnly />
      </div>
    </main>
  );
}
