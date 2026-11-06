import type { Metadata } from 'next';
import HomeEntry from '@/app/components/landing/HomeEntry';
import ServiceIntroduction from '@/app/components/landing/ServiceIntroduction';

export const metadata: Metadata = {
  title: '그로우두 GrowDo | 할 일·습관·목표를 한곳에서',
  description:
    '오늘 할 일을 정리하고, 매일의 습관과 목표를 이어가세요. 도전과제로 포인트를 모아 작은 보상도 만나는 일상 관리 서비스, 그로우두.',
  alternates: { canonical: '/' },
  openGraph: {
    title: '그로우두 GrowDo | 오늘도 하나씩',
    description: '할 일·습관·목표 관리부터 도전과제와 보상까지. 나에게 맞는 속도로 이어가는 하루.',
    url: '/',
    siteName: 'GrowDo',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <HomeEntry>
      <ServiceIntroduction />
    </HomeEntry>
  );
}
