import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, ChevronDown, Mail } from 'lucide-react';
import ThemeToggleStandalone from '@/app/components/ThemeToggleStandalone';

export const metadata: Metadata = {
  title: '고객지원 | GrowDo',
  description: 'GrowDo 사용 중 궁금한 점과 문제 해결 방법을 확인하고 문의할 수 있습니다.',
};

const contactEmail = 'okpc0305@gmail.com';

const questions = [
  {
    question: '습관, 할 일, 목표는 어떻게 다른가요?',
    answer:
      '습관은 반복할 행동, 할 일은 특정 날짜에 끝낼 일, 목표는 매일·매주·매월 정한 기간 안에 달성할 일을 기록할 때 사용해요.',
  },
  {
    question: '지난 날짜의 할 일이나 목표를 완료할 수 있나요?',
    answer:
      '지난 날짜의 기록은 달력에서 확인할 수 있지만, 마감된 항목을 나중에 완료 처리할 수는 없어요. 미래 날짜에 등록한 할 일도 해당 날짜가 되어야 완료할 수 있어요.',
  },
  {
    question: '챌린지와 포인트는 언제 반영되나요?',
    answer:
      '습관·할 일·목표를 완료하면 관련 챌린지의 진행도가 반영돼요. 챌린지를 달성해 받은 포인트는 화면 상단에서 확인할 수 있어요. 표시가 갱신되지 않는다면 화면을 다시 열어 확인해 주세요.',
  },
  {
    question: '교환한 쿠폰이 보이지 않아요.',
    answer:
      '먼저 내 쿠폰함을 확인해 주세요. 교환 내역은 있는데 쿠폰이 보이지 않는다면 아래 이메일로 로그인 이메일과 교환한 보상 이름, 교환 시각을 알려주세요. 쿠폰 번호 전체는 보내지 않아도 돼요.',
  },
  {
    question: '로그인이 잘되지 않아요.',
    answer:
      '이전에 사용한 로그인 제공자(구글·카카오·네이버·애플)를 확인하고 다시 시도해 주세요. 계속 실패한다면 오류 화면과 사용한 브라우저 또는 기기 정보를 함께 보내주시면 확인하는 데 도움이 돼요.',
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#d9e1d5] px-3 py-3 dark:bg-background sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[1180px] overflow-hidden rounded-[2rem] bg-[#fbf8ef] text-[#26302a] shadow-[0_24px_70px_rgba(38,48,42,0.12)] dark:bg-card dark:text-foreground">
        <header className="flex min-h-20 items-center justify-between border-b border-border px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="GrowDo 홈">
            <Image src="/growdo-logo.png" alt="" width={38} height={38} className="size-9 rounded-xl" />
            <span className="friendly-heading text-xl font-bold tracking-[-0.06em]">GrowDo</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-4"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">오늘로 돌아가기</span>
            </Link>
            <ThemeToggleStandalone />
          </div>
        </header>

        <main>
          <section className="grid border-b border-border lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
            <div className="px-5 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
              <p className="text-xs font-bold tracking-[0.16em] text-primary">GROWDO SUPPORT</p>
              <h1 className="friendly-heading mt-4 max-w-2xl text-4xl font-bold leading-[1.12] tracking-[-0.055em] sm:text-5xl">
                막히는 순간에도,
                <br />함께 풀어볼게요.
              </h1>
              <p className="mt-6 max-w-xl break-keep text-sm leading-7 text-muted-foreground sm:text-base">
                자주 묻는 내용을 먼저 살펴보세요. 해결되지 않았다면 아래 이메일로 편하게 알려주세요.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`mailto:${contactEmail}?subject=GrowDo%20%EB%AC%B8%EC%9D%98`}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  이메일로 문의하기 <ArrowUpRight className="size-4" />
                </a>
                <Link
                  href="/guide"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border px-5 text-sm font-bold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  사용법 살펴보기 <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>
            <aside className="flex flex-col justify-end bg-[#e9f1e5] px-5 py-9 dark:bg-secondary sm:px-10 lg:px-12 lg:py-16">
              <Mail className="size-7 text-primary" aria-hidden="true" />
              <p className="friendly-heading mt-7 text-2xl font-bold tracking-[-0.04em]">문의할 때 알려주세요</p>
              <p className="mt-3 break-keep text-sm leading-7 text-muted-foreground">
                로그인 이메일, 어떤 화면에서 문제가 생겼는지, 발생 시각을 적어주시면 확인에 도움이 돼요.
                가능하다면 오류 화면도 첨부해 주세요.
              </p>
              <p className="mt-5 text-xs leading-6 text-muted-foreground">
                비밀번호나 쿠폰 번호 전체처럼 민감한 정보는 보내지 마세요.
              </p>
            </aside>
          </section>

          <section className="grid gap-8 px-5 py-12 sm:px-10 sm:py-16 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(0,1.3fr)] lg:gap-16 lg:px-16">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-primary">HELP DESK</p>
              <h2 className="friendly-heading mt-3 text-3xl font-bold tracking-[-0.05em]">자주 묻는 질문</h2>
              <p className="mt-4 max-w-xs break-keep text-sm leading-7 text-muted-foreground">
                기록부터 보상까지, 많이 궁금해하는 내용을 모았어요.
              </p>
            </div>
            <div className="border-t border-border">
              {questions.map((item) => (
                <details key={item.question} className="group border-b border-border">
                  <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-5 py-5 text-left text-base font-bold marker:hidden [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <ChevronDown className="size-5 shrink-0 text-primary transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="max-w-2xl break-keep pb-7 pr-7 text-sm leading-7 text-muted-foreground">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-6 bg-[#28342d] px-5 py-10 text-[#f7f3e9] sm:px-10 lg:flex-row lg:items-end lg:justify-between lg:px-16">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[#8ecb9f]">STILL NEED HELP?</p>
              <h2 className="friendly-heading mt-2 text-2xl font-bold sm:text-3xl">답을 찾지 못하셨나요?</h2>
              <p className="mt-3 text-sm leading-6 text-[#c9d8cd]">문의 내용을 적어 보내주시면 확인하겠습니다.</p>
            </div>
            <a
              href={`mailto:${contactEmail}?subject=GrowDo%20%EB%AC%B8%EC%9D%98`}
              className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-[#3aa45f] px-6 text-sm font-bold text-white transition-colors hover:bg-[#319153] lg:self-auto"
            >
              {contactEmail} <ArrowUpRight className="size-4" />
            </a>
          </section>
        </main>

        <footer className="flex flex-wrap gap-x-5 gap-y-2 border-t border-border px-5 py-6 text-xs text-muted-foreground sm:px-10 lg:px-16">
          <Link href="/terms" className="hover:text-foreground">이용약관</Link>
          <Link href="/privacy" className="hover:text-foreground">개인정보처리방침</Link>
        </footer>
      </div>
    </div>
  );
}
