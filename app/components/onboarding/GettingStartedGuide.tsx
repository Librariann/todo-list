'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, Check, Repeat2, Target, X } from 'lucide-react';
import type { TaskTabType } from '@/app/types/navigation';

interface GettingStartedGuideProps {
  userId?: string | number;
  onCreate: (type: TaskTabType) => void;
}

interface TourStep {
  selector: string;
  eyebrow: string;
  title: string;
  description: string;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface GuideLayout {
  stepIndex: number;
  spotlight: SpotlightRect | null;
  panelTop: number;
  panelLeft: number;
}

const panelGap = 12;

const steps: TourStep[] = [
  {
    selector: '[data-tour="home-hero"]',
    eyebrow: '오늘의 시작',
    title: '오늘 필요한 것부터 확인해요',
    description: '선택한 날짜와 인사말 아래에서 오늘의 계획을 가볍게 시작할 수 있어요.',
  },
  {
    selector: '[data-tour="task-tabs"]',
    eyebrow: '세 가지 기록',
    title: '성격에 맞게 나눠서 관리해요',
    description: '반복은 습관, 한 번 끝낼 일은 할 일, 기간 안에 이룰 것은 목표에 담아요.',
  },
  {
    selector: '[data-tour="task-add"]',
    eyebrow: '첫 번째 행동',
    title: '이 버튼으로 바로 추가해요',
    description: '복잡하게 계획하지 않아도 괜찮아요. 지금 필요한 한 가지만 적어보세요.',
  },
  {
    selector: '[data-tour="task-insights"]',
    eyebrow: '날짜와 흐름',
    title: '달력에서 지난 기록도 돌아봐요',
    description: '날짜별 기록을 확인하고, 오늘 완료할 수 있는 항목의 흐름을 한눈에 볼 수 있어요.',
  },
  {
    selector: '[data-tour="header-points"]',
    eyebrow: '이어갈 이유',
    title: '기록은 챌린지와 포인트로 이어져요',
    description: '완료하면 챌린지가 자동으로 진행되고, 모은 포인트는 보상으로 교환할 수 있어요.',
  },
];

const choices: Array<{
  type: TaskTabType;
  label: string;
  description: string;
  icon: typeof Repeat2;
}> = [
  { type: 'habits', label: '습관', description: '매일 반복할 행동', icon: Repeat2 },
  { type: 'todos', label: '할 일', description: '오늘 끝낼 한 가지', icon: Check },
  { type: 'goals', label: '목표', description: '기간 안에 이룰 결과', icon: Target },
];

function findVisibleTarget(selector: string): HTMLElement | null {
  return (
    Array.from(document.querySelectorAll<HTMLElement>(selector)).find((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }) ?? null
  );
}

function measureSpotlight(rect: DOMRect, viewport: DOMRect, padding: number): SpotlightRect | null {
  const top = Math.max(viewport.top, rect.top - padding);
  const left = Math.max(viewport.left, rect.left - padding);
  const right = Math.min(viewport.right, rect.right + padding);
  const bottom = Math.min(viewport.bottom, rect.bottom + padding);
  if (right <= left || bottom <= top) return null;
  return { top, left, width: right - left, height: bottom - top };
}

export default function GettingStartedGuide({ userId, onCreate }: GettingStartedGuideProps) {
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);
  const [choosing, setChoosing] = useState<boolean>(false);
  const [layout, setLayout] = useState<GuideLayout | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const storageKey = `growdo:onboarding:v2:${userId ?? 'user'}`;
  const step = steps[stepIndex];

  useEffect(() => {
    setVisible(window.localStorage.getItem(storageKey) !== 'done');
  }, [storageKey]);

  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        window.localStorage.setItem(storageKey, 'done');
        setVisible(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [storageKey, visible]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const safeViewport = viewportRef.current;
    if (!visible || choosing || !panel || !safeViewport) return;

    const main = document.getElementById('main-content');
    const workspace = main?.parentElement;
    let observedTarget: HTMLElement | null = null;
    let frame = 0;

    function scheduleLayout() {
      if (!frame) frame = window.requestAnimationFrame(updateLayout);
    }

    const resizeObserver = new ResizeObserver(scheduleLayout);
    const updateLayout = () => {
      frame = 0;
      const target = findVisibleTarget(step.selector);
      const viewport = safeViewport.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const compact = viewport.width < 640;
      const padding = compact ? 6 : 10;
      let rect = target?.getBoundingClientRect();

      if (target !== observedTarget) {
        if (observedTarget) resizeObserver.unobserve(observedTarget);
        observedTarget = target;
        if (target && rect) {
          resizeObserver.observe(target);
          const belowRoom = viewport.bottom - rect.bottom - padding;
          const aboveRoom = rect.top - viewport.top - padding;
          if (
            rect.top < viewport.top ||
            rect.bottom > viewport.bottom ||
            Math.max(aboveRoom, belowRoom) < panelRect.height + panelGap
          ) {
            const groupHeight = rect.height + padding * 2 + panelGap + panelRect.height;
            const targetTop = viewport.top + padding + Math.max(0, (viewport.height - groupHeight) / 2);
            window.scrollBy({ top: rect.top - targetTop, behavior: 'instant' });
            rect = target.getBoundingClientRect();
          }
        }
      }

      const spotlight = rect ? measureSpotlight(rect, viewport, padding) : null;
      const maxTop = Math.max(viewport.top, viewport.bottom - panelRect.height);
      const centeredLeft = viewport.left + (viewport.width - panelRect.width) / 2;
      const centeredTop = (viewport.top + maxTop) / 2;
      let panelTop = centeredTop;
      let panelLeft = centeredLeft;

      if (spotlight) {
        const below = spotlight.top + spotlight.height + panelGap;
        const above = spotlight.top - panelRect.height - panelGap;
        if (below <= maxTop) panelTop = below;
        else if (above >= viewport.top) panelTop = above;
        else panelTop = below - maxTop <= viewport.top - above ? maxTop : viewport.top;
        if (!compact) {
          panelLeft = Math.max(viewport.left, Math.min(spotlight.left, viewport.right - panelRect.width));
        }
      }

      setLayout({ stepIndex, spotlight, panelTop, panelLeft });
      // The page entrance animates its position without changing its measured size.
      if (main?.getAnimations().some((animation) => animation.playState === 'running')) {
        scheduleLayout();
      }
    };

    resizeObserver.observe(panel);
    resizeObserver.observe(safeViewport);
    if (workspace) resizeObserver.observe(workspace);
    // A notice or an asynchronously loaded section can appear after the first measurement.
    const contentObserver = new MutationObserver(scheduleLayout);
    if (workspace) contentObserver.observe(workspace, { childList: true, subtree: true });
    updateLayout();
    window.addEventListener('resize', scheduleLayout);
    window.addEventListener('scroll', scheduleLayout, true);
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      contentObserver.disconnect();
      window.removeEventListener('resize', scheduleLayout);
      window.removeEventListener('scroll', scheduleLayout, true);
    };
  }, [choosing, step.selector, stepIndex, visible]);

  useEffect(() => {
    if (visible) nextButtonRef.current?.focus({ preventScroll: true });
  }, [choosing, stepIndex, visible]);

  const finish = () => {
    window.localStorage.setItem(storageKey, 'done');
    setVisible(false);
  };

  const handleNext = () => {
    if (stepIndex === steps.length - 1) {
      setChoosing(true);
      return;
    }
    setStepIndex((current) => current + 1);
  };

  if (!visible) return null;

  const currentLayout = layout?.stepIndex === stepIndex ? layout : null;
  const spotlight = currentLayout?.spotlight;

  return createPortal(
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-label="GrowDo 시작 안내"
    >
      <div
        ref={viewportRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))]"
      />
      {spotlight && !choosing ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[101] rounded-2xl"
          style={{
            ...spotlight,
            boxShadow: '0 0 0 2px #8fe0a4, 0 0 0 9999px rgba(12, 24, 17, 0.78)',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[rgba(12,24,17,0.84)]" />
      )}

      <button
        type="button"
        onClick={finish}
        className="fixed right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-[103] grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="시작 안내 건너뛰기"
      >
        <X className="size-5" />
      </button>

      {choosing ? (
        <div className="fixed inset-x-4 top-1/2 z-[102] mx-auto max-w-xl -translate-y-1/2 overflow-hidden rounded-[2rem] bg-[#f8f4e9] text-[#233129] shadow-[0_30px_100px_rgba(0,0,0,0.38)] dark:bg-[#203128] dark:text-[#f3f5ed] sm:inset-x-auto sm:w-[34rem]">
          <div className="px-6 pb-5 pt-7 sm:px-8 sm:pt-8">
            <p className="text-xs font-bold tracking-[0.16em] text-[#318c50] dark:text-[#82d49a]">
              이제 직접 해볼 차례예요
            </p>
            <h2 className="friendly-heading mt-2 text-3xl font-bold tracking-[-0.05em]">
              무엇부터 기록할까요?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#647269] dark:text-[#bac9bf]">
              하나를 고르면 실제 등록 화면이 바로 열려요.
            </p>
          </div>
          <div className="divide-y divide-[#d9dfd5] border-t border-[#d9dfd5] dark:divide-white/10 dark:border-white/10">
            {choices.map((choice) => {
              const Icon = choice.icon;
              return (
                <button
                  key={choice.type}
                  type="button"
                  onClick={() => {
                    finish();
                    onCreate(choice.type);
                  }}
                  className="group flex min-h-[4.75rem] w-full items-center gap-4 px-6 text-left transition-colors hover:bg-[#e6eee0] dark:hover:bg-white/[0.06] sm:px-8"
                >
                  <Icon className="size-5 shrink-0 text-[#318c50] dark:text-[#82d49a]" />
                  <span className="min-w-0 flex-1">
                    <strong className="block text-sm font-bold">{choice.label}</strong>
                    <span className="mt-0.5 block text-sm text-[#647269] dark:text-[#bac9bf]">
                      {choice.description}
                    </span>
                  </span>
                  <ArrowRight className="size-4 text-[#708078] transition-transform group-hover:translate-x-1" />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <section
          ref={panelRef}
          className={`fixed z-[102] max-h-[calc(100dvh-max(1rem,env(safe-area-inset-top))-max(1rem,env(safe-area-inset-bottom)))] w-[calc(100%-max(1rem,env(safe-area-inset-left))-max(1rem,env(safe-area-inset-right)))] max-w-[23rem] overflow-y-auto rounded-[1.6rem] bg-[#f8f4e9] p-5 text-[#233129] shadow-[0_24px_80px_rgba(0,0,0,0.34)] dark:bg-[#203128] dark:text-[#f3f5ed] sm:p-6 ${currentLayout ? '' : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'}`}
          style={currentLayout ? { top: currentLayout.panelTop, left: currentLayout.panelLeft } : undefined}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-bold tracking-[0.14em] text-[#318c50] dark:text-[#82d49a]">
              {step.eyebrow}
            </p>
            <p className="text-xs font-bold tabular-nums text-[#8a958e] dark:text-[#90a098]">
              {stepIndex + 1} / {steps.length}
            </p>
          </div>
          <h2 className="friendly-heading mt-2 text-2xl font-bold leading-tight tracking-[-0.045em]">
            {step.title}
          </h2>
          <p className="mt-2 break-keep text-sm leading-6 text-[#647269] dark:text-[#bac9bf]">
            {step.description}
          </p>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              disabled={stepIndex === 0}
              className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-bold text-[#66746c] transition-colors hover:bg-black/5 disabled:invisible dark:text-[#b5c3b9] dark:hover:bg-white/10"
            >
              <ArrowLeft className="size-4" />
              이전
            </button>
            <div className="flex gap-1.5" aria-hidden="true">
              {steps.map((tourStep, index) => (
                <span
                  key={tourStep.selector}
                  className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                    index === stepIndex
                      ? 'w-5 bg-[#318c50] dark:bg-[#82d49a]'
                      : 'w-1.5 bg-[#c2cbc4] dark:bg-[#526158]'
                  }`}
                />
              ))}
            </div>
            <button
              ref={nextButtonRef}
              type="button"
              onClick={handleNext}
              className="inline-flex min-h-11 items-center gap-1 rounded-full bg-[#318c50] px-4 text-sm font-bold text-white transition-colors hover:bg-[#277b43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#318c50] focus-visible:ring-offset-2"
            >
              {stepIndex === steps.length - 1 ? '시작하기' : '다음'}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </section>
      )}
    </div>,
    document.body
  );
}
