import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import ThemeToggleStandalone from '@/app/components/ThemeToggleStandalone';
import LandingPreview from './LandingPreview';

const features = [
  {
    number: '01',
    title: '할 일은 오늘에 집중해서',
    description:
      '미뤄둔 연락부터 오늘 끝낼 일까지. 날짜에 맞게 정리하고, 시작한 일과 완료한 일을 구분해요.',
    example: '책상 정리하기 · 미뤄둔 연락 보내기',
  },
  {
    number: '02',
    title: '습관은 작게, 반복해서',
    description:
      '매일 몇 번 실천할지 정하고 하나씩 기록해요. 오늘의 진행도와 이어온 기록을 보며 내 페이스를 찾아가요.',
    example: '물 마시기 · 스트레칭하기',
  },
  {
    number: '03',
    title: '목표는 나에게 맞는 주기로',
    description:
      '매일, 매주, 매월. 목표에 맞는 주기를 고르고 달력에서 시작과 달성의 흔적을 확인해요.',
    example: '매주 책 한 권 읽기 · 매월 새로운 곳 가보기',
  },
];
const questions = [
  {
    question: '앱을 설치하지 않아도 사용할 수 있나요?',
    answer:
      '네. 웹 브라우저에서 로그인해 할 일, 습관, 목표를 관리할 수 있어요. 컴퓨터와 휴대폰에서 같은 계정으로 이용해 보세요.',
  },
  {
    question: '어떤 계정으로 시작할 수 있나요?',
    answer:
      'Google, 카카오, 네이버, Apple 계정으로 시작할 수 있어요. 다음에도 같은 로그인 방법을 선택하면 이어서 사용할 수 있어요.',
  },
  {
    question: '할 일을 완료할 때마다 포인트를 받나요?',
    answer:
      '포인트는 서비스에서 안내하는 도전과제의 달성 조건에 따라 지급돼요. 할 일, 습관, 목표를 기록한 뒤 도전과제 화면에서 조건과 진행도를 확인해 주세요.',
  },
  {
    question: '모은 포인트는 어떻게 사용하나요?',
    answer:
      '보상 화면에서 교환 가능한 상품을 선택할 수 있어요. 필요한 포인트와 재고 등 교환 조건은 상품별로 달라요. 교환한 쿠폰의 유효기간과 사용 방법은 내 쿠폰함에서 확인해 주세요.',
  },
];
const primaryLink =
  'inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring';

export default function ServiceIntroduction() {
  return (
    <div className="min-h-dvh bg-background text-foreground [--primary:oklch(0.52_0.14_145)] dark:[--primary:oklch(0.72_0.14_145)]">
      <a
        href="#intro-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-card focus:p-4"
      >
        본문으로 바로가기
      </a>
      <header className="border-b border-border/70">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            aria-label="GrowDo 소개 홈"
            className="flex min-h-11 shrink-0 items-center gap-2.5"
          >
            <Image
              src="/growdo-logo.png"
              alt=""
              width={36}
              height={36}
              className="rounded-lg"
              priority
            />
            <span className="friendly-heading text-2xl font-bold tracking-[-0.06em]">GrowDo</span>
          </Link>
          <nav
            className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex"
            aria-label="서비스 소개 메뉴"
          >
            <a href="#features" className="inline-flex min-h-11 items-center hover:text-foreground">
              이렇게 사용해요
            </a>
            <a href="#rewards" className="inline-flex min-h-11 items-center hover:text-foreground">
              도전과제와 보상
            </a>
            <a href="#faq" className="inline-flex min-h-11 items-center hover:text-foreground">
              궁금한 점
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <ThemeToggleStandalone />
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-bold text-primary hover:bg-secondary sm:px-4"
            >
              로그인
            </Link>
          </div>
        </div>
      </header>

      <main id="intro-main">
        <section
          className="mx-auto grid max-w-7xl items-center gap-12 px-5 pt-14 pb-16 sm:px-8 sm:pt-20 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:px-12 lg:pt-24 lg:pb-24"
          aria-labelledby="intro-title"
        >
          <div className="min-w-0">
            <p className="text-sm font-bold text-primary">오늘도 하나씩, 그로우두</p>
            <h1
              id="intro-title"
              className="friendly-heading mt-5 break-keep text-[clamp(2.6rem,5.4vw,4.5rem)] font-bold leading-[1.2] tracking-[-0.06em]"
            >
              오늘 할 일,
              <br />
              꾸준한 습관,
              <br />
              한곳에서 가볍게.
            </h1>
            <p className="mt-7 max-w-md break-keep text-base leading-8 text-muted-foreground sm:text-lg">
              머릿속에 쌓인 계획을 꺼내놓고,
              <br className="hidden sm:block" /> 나에게 맞는 속도로 하나씩 이어가요.
              <br className="hidden sm:block" /> 작은 실천이 모이면 보상도 만날 수 있어요.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/login" className={primaryLink}>
                내 하루 시작하기 <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
              <a
                href="#preview"
                className="inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                먼저 둘러보기 <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              Google · 카카오 · 네이버 · Apple 계정으로 시작해요.
            </p>
          </div>
          <div
            id="preview"
            className="min-w-0 scroll-mt-6 rounded-[2rem] bg-[#dfeadd] p-3 dark:bg-secondary/45 sm:p-5"
          >
            <LandingPreview />
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-6 border-t border-border"
          aria-labelledby="features-title"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-12 lg:py-24">
            <div>
              <p className="text-sm font-bold text-primary">하루를 정리하는 세 가지 방법</p>
              <h2
                id="features-title"
                className="friendly-heading mt-4 break-keep text-3xl font-bold leading-[1.35] tracking-[-0.05em] sm:text-4xl"
              >
                한 번 할 일도,
                <br />
                오래 이어갈 일도.
              </h2>
              <p className="mt-5 max-w-sm break-keep text-base leading-7 text-muted-foreground">
                다 같은 계획은 아니니까.
                <br />
                각각에 어울리는 방식으로 정리해요.
              </p>
              <Link
                href="/guide"
                className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline hover:underline-offset-4"
              >
                사용법 자세히 보기 <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {features.map((feature) => (
                <article
                  key={feature.number}
                  className="flex gap-4 py-7 first:pt-0 last:pb-0 sm:gap-6"
                >
                  <span
                    aria-hidden="true"
                    className="pt-1 text-sm font-bold text-primary tabular-nums"
                  >
                    {feature.number}
                  </span>
                  <div className="min-w-0">
                    <h3 className="break-keep text-xl font-bold tracking-tight">{feature.title}</h3>
                    <p className="mt-3 break-keep text-sm leading-7 text-muted-foreground sm:text-base">
                      {feature.description}
                    </p>
                    <p className="mt-3 break-keep text-xs leading-6 text-primary sm:text-sm">
                      예를 들면, {feature.example}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="rewards"
          className="scroll-mt-6 bg-[#263d30] text-[#f6f8ee]"
          aria-labelledby="rewards-title"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-12 lg:py-24">
            <div>
              <p className="text-sm font-bold text-[#b1d6b4]">도전과제와 작은 보상</p>
              <h2
                id="rewards-title"
                className="friendly-heading mt-4 break-keep text-3xl font-bold leading-[1.35] tracking-[-0.05em] sm:text-4xl"
              >
                꾸준함에,
                <br />
                작은 기쁨을 더해요.
              </h2>
              <p className="mt-5 max-w-md break-keep text-base leading-8 text-[#d0ddce]">
                체크 하나로 끝나는 하루가 아쉬울 때,
                <br />
                도전과제가 다음 실천의 계기가 되어줘요.
              </p>
            </div>
            <div>
              <ol className="space-y-7">
                {[
                  ['도전과제를 확인해요', '지금 참여할 수 있는 도전과제와 달성 조건을 살펴보세요.'],
                  [
                    '실천하고 포인트를 모아요',
                    '기록이 쌓여 도전과제 조건을 채우면 보상 포인트를 받아요.',
                  ],
                  [
                    '원하는 작은 보상을 골라요',
                    '교환 가능한 쿠폰을 선택하고 내 쿠폰함에서 확인해요.',
                  ],
                ].map(([title, description], index) => (
                  <li
                    key={title}
                    className="flex gap-4 border-b border-[#d0ddce]/20 pb-6 last:border-0 last:pb-0"
                  >
                    <span className="pt-0.5 text-sm font-bold text-[#b1d6b4] tabular-nums">
                      0{index + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold">{title}</h3>
                      <p className="mt-2 break-keep text-sm leading-6 text-[#d0ddce]">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-7 break-keep text-xs leading-6 text-[#b1c9b4]">
                지급 포인트와 상품·재고·교환 조건은 서비스 내 안내를 기준으로 해요. 쿠폰별
                유효기간과 이용 안내를 꼭 확인해 주세요.
              </p>
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="mx-auto max-w-4xl scroll-mt-6 px-5 py-16 sm:px-8 lg:py-24"
          aria-labelledby="faq-title"
        >
          <h2
            id="faq-title"
            className="friendly-heading mb-8 text-balance break-keep text-3xl font-bold tracking-[-0.05em] sm:text-4xl"
          >
            시작하기 전에 궁금한 점
          </h2>
          <div className="divide-y divide-border border-y border-border">
            {questions.map((item) => (
              <details key={item.question} className="group py-1">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-semibold focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-ring sm:text-base [&::-webkit-details-marker]:hidden">
                  <span className="break-keep">{item.question}</span>
                  <ChevronDown
                    className="size-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </summary>
                <p className="pb-6 pr-6 break-keep text-sm leading-7 text-muted-foreground sm:text-base">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
          <Link
            href="/support"
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline hover:underline-offset-4"
          >
            다른 궁금한 점이 있나요? <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>

        <section
          className="border-t border-border bg-secondary/40 px-5 py-16 text-center sm:px-8 sm:py-20"
          aria-labelledby="start-title"
        >
          <h2
            id="start-title"
            className="friendly-heading break-keep text-3xl font-bold leading-[1.35] tracking-[-0.05em] sm:text-4xl"
          >
            이번엔, 하나만 시작해볼까요?
          </h2>
          <p className="mt-4 break-keep text-base leading-7 text-muted-foreground">
            거창한 계획 대신, 오늘 해낼 작은 일 하나.
          </p>
          <Link href="/login" className={`${primaryLink} mt-7`}>
            GrowDo 시작하기 <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-xs text-muted-foreground sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
        <p>
          <span className="font-bold text-foreground">GrowDo</span>
          <span className="ml-3">오늘도 하나씩, 나에게 맞는 속도로.</span>
        </p>
        <nav className="flex flex-wrap gap-x-5" aria-label="서비스 정보">
          {[
            ['/guide', '사용법'],
            ['/support', '고객지원'],
            ['/notice', '공지사항'],
            ['/terms', '이용약관'],
            ['/privacy', '개인정보처리방침'],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="inline-flex min-h-11 items-center hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}
