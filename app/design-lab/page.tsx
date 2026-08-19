'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  ListTodo,
  Menu,
  Plus,
  RotateCcw,
} from 'lucide-react';

type ConceptId = 'flow' | 'strip' | 'rooms';

interface PreviewTask {
  id: number;
  title: string;
  detail: string;
  group: 'morning' | 'afternoon' | 'evening';
  done: boolean;
}

const conceptLabels: { id: ConceptId; number: string; title: string; description: string }[] = [
  { id: 'flow', number: '01', title: '하루의 흐름', description: '스크롤형 데일리 피드' },
  { id: 'strip', number: '02', title: '오늘의 리본', description: '가로형 액션 스트립' },
  { id: 'rooms', number: '03', title: '나의 작은 공간', description: '구역형 워크스페이스' },
];

const initialTasks: PreviewTask[] = [
  { id: 1, title: '물 한 잔으로 시작하기', detail: '아침 루틴', group: 'morning', done: true },
  { id: 2, title: '기획안 첫 문단 완성하기', detail: '오늘의 중요한 일', group: 'morning', done: false },
  { id: 3, title: '메일 답장 세 개 보내기', detail: '15분이면 충분해요', group: 'afternoon', done: false },
  { id: 4, title: '저녁 산책 20분', detail: '퇴근 후 천천히', group: 'evening', done: false },
];

const week = [
  { day: '월', date: '11', done: true },
  { day: '화', date: '12', done: true },
  { day: '수', date: '13', done: true },
  { day: '목', date: '14', done: false, today: true },
  { day: '금', date: '15', done: false },
  { day: '토', date: '16', done: false },
  { day: '일', date: '17', done: false },
];

export default function DesignLabPage() {
  const [concept, setConcept] = useState<ConceptId>('flow');
  const [tasks, setTasks] = useState<PreviewTask[]>(initialTasks);

  const completedCount = useMemo(() => tasks.filter((task) => task.done).length, [tasks]);

  const handleToggleTask = (id: number) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );
  };

  const handleReset = () => setTasks(initialTasks);

  return (
    <main className="min-h-screen bg-[#161a17] text-[#20231f]">
      <header className="sticky top-0 z-50 flex min-h-20 items-center justify-between gap-5 border-b border-white/10 bg-[#161a17]/95 px-4 text-[#f4f1e7] backdrop-blur-md sm:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <span className="hidden text-xs font-semibold tracking-[0.22em] text-[#8e988f] sm:inline">
            GROWDO / DESIGN LAB
          </span>
          <span className="hidden h-5 w-px bg-white/15 sm:block" />
          <p className="truncate text-sm text-[#c4cbc4]">완전히 다른 세 가지 화면 구조</p>
        </div>

        <nav className="flex rounded-full border border-white/12 bg-white/[0.04] p-1" aria-label="디자인 시안 선택">
          {conceptLabels.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setConcept(item.id)}
              className={`flex min-h-11 items-center gap-2 rounded-full px-3 text-sm transition-colors sm:px-5 ${
                concept === item.id
                  ? 'bg-[#f1eddf] font-semibold text-[#20231f]'
                  : 'text-[#aab2ab] hover:text-[#f1eddf]'
              }`}
              aria-pressed={concept === item.id}
            >
              <span className="text-[0.68rem] opacity-60">{item.number}</span>
              <span className="hidden sm:inline">{item.title}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleReset}
          className="flex min-h-11 items-center gap-2 text-sm text-[#aab2ab] transition-colors hover:text-white"
        >
          <RotateCcw size={15} />
          <span className="hidden sm:inline">초기화</span>
        </button>
      </header>

      {concept === 'flow' && (
        <FlowConcept tasks={tasks} completedCount={completedCount} onToggle={handleToggleTask} />
      )}
      {concept === 'strip' && (
        <StripConcept tasks={tasks} completedCount={completedCount} onToggle={handleToggleTask} />
      )}
      {concept === 'rooms' && (
        <RoomsConcept tasks={tasks} completedCount={completedCount} onToggle={handleToggleTask} />
      )}
    </main>
  );
}

interface ConceptProps {
  tasks: PreviewTask[];
  completedCount: number;
  onToggle: (id: number) => void;
}

function FlowConcept({ tasks, completedCount, onToggle }: ConceptProps) {
  const sections = [
    { key: 'morning' as const, label: '오전', time: '지금부터', note: '가장 맑은 시간에는 중요한 일을 하나만.' },
    { key: 'afternoon' as const, label: '오후', time: '점심 이후', note: '짧은 일은 한 번에 모아서 가볍게.' },
    { key: 'evening' as const, label: '저녁', time: '하루의 끝', note: '오늘을 정리하고 내일의 여백을 남겨요.' },
  ];

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-[#f2f0e8] text-[#253027]">
      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[17rem_minmax(0,1fr)_18rem]">
        <aside className="border-b border-[#253027]/15 px-6 py-8 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:border-r lg:border-b-0 lg:px-8 lg:py-12">
          <div className="flex items-center justify-between lg:block">
            <a href="#" className="font-[family-name:var(--font-friendly)] text-2xl tracking-tight">
              GrowDo
            </a>
            <button type="button" className="grid size-11 place-items-center rounded-full border border-[#253027]/20 lg:hidden" aria-label="메뉴 열기">
              <Menu size={19} />
            </button>
          </div>

          <div className="mt-16 hidden lg:block">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#758079]">8월 14일 · 목요일</p>
            <h1 className="mt-5 font-[family-name:var(--font-friendly)] text-5xl leading-[1.18] tracking-[-0.06em]">
              지은님의<br />하루가<br />여기 있어요.
            </h1>
          </div>

          <nav className="mt-16 hidden space-y-1 lg:block" aria-label="주 메뉴">
            {['오늘', '이어가는 습관', '긴 목표', '모아둔 보상'].map((label, index) => (
              <a
                key={label}
                href="#"
                className={`flex min-h-12 items-center justify-between border-b border-[#253027]/10 text-sm ${index === 0 ? 'font-bold' : 'text-[#6f7871]'}`}
              >
                {label}
                {index === 0 && <span className="size-2 rounded-full bg-[#2b9957]" />}
              </a>
            ))}
          </nav>

          <p className="mt-auto hidden pt-16 text-xs leading-5 text-[#788079] lg:block">
            할 일을 많이 담기보다<br />오늘의 리듬을 지켜보세요.
          </p>
        </aside>

        <div className="px-5 py-10 sm:px-10 lg:px-14 lg:py-16 xl:px-20">
          <div className="mb-16 flex items-end justify-between gap-8">
            <div>
              <p className="text-sm text-[#6d766f] lg:hidden">8월 14일 · 목요일</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">오늘은 세 가지만.</h2>
            </div>
            <button type="button" className="flex min-h-11 shrink-0 items-center gap-2 border-b-2 border-[#253027] text-sm font-semibold">
              <Plus size={16} /> 할 일
            </button>
          </div>

          <div>
            {sections.map((section, sectionIndex) => {
              const sectionTasks = tasks.filter((task) => task.group === section.key);
              return (
                <section key={section.key} className="grid border-t border-[#253027]/20 py-10 sm:grid-cols-[7rem_1fr] sm:gap-8">
                  <div>
                    <p className="text-xs font-bold tracking-[0.16em] text-[#288850]">{section.label}</p>
                    <p className="mt-2 text-xs text-[#808880]">{section.time}</p>
                  </div>
                  <div className="mt-7 sm:mt-0">
                    {sectionTasks.length > 0 ? (
                      <div className="space-y-1">
                        {sectionTasks.map((task) => (
                          <button
                            key={task.id}
                            type="button"
                            onClick={() => onToggle(task.id)}
                            className="group flex min-h-20 w-full items-center gap-5 text-left"
                          >
                            <span className={`grid size-8 shrink-0 place-items-center rounded-full border transition-colors ${task.done ? 'border-[#2b9957] bg-[#2b9957] text-white' : 'border-[#9ca29d] group-hover:border-[#2b9957]'}`}>
                              {task.done && <Check size={16} strokeWidth={3} />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={`block text-xl font-semibold tracking-[-0.03em] sm:text-2xl ${task.done ? 'text-[#89908a] line-through' : ''}`}>{task.title}</span>
                              <span className="mt-1 block text-sm text-[#808880]">{task.detail}</span>
                            </span>
                            <ChevronRight size={18} className="opacity-0 transition-opacity group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="py-5 text-[#8b928c]">아직 비어 있어요.</p>
                    )}
                    {sectionIndex === 0 && <p className="mt-7 max-w-md text-sm leading-6 text-[#727b74]">{section.note}</p>}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <aside className="border-t border-[#253027]/15 bg-[#e4eddf] px-6 py-10 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:border-t-0 lg:border-l lg:px-8 lg:py-12">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold tracking-[0.15em] text-[#536259]">이번 주의 리듬</p>
            <span className="text-sm font-semibold">3일째</span>
          </div>

          <div className="mt-8 flex justify-between gap-2">
            {week.map((item) => (
              <div key={item.day} className="text-center">
                <span className="text-[0.65rem] text-[#667168]">{item.day}</span>
                <span className={`mt-2 grid size-7 place-items-center rounded-full text-xs ${item.done ? 'bg-[#2c9253] text-white' : item.today ? 'border border-[#2c9253] text-[#236e42]' : 'text-[#899188]'}`}>
                  {item.done ? <Check size={12} strokeWidth={3} /> : item.date}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-16 border-t border-[#253027]/15 pt-8">
            <p className="font-[family-name:var(--font-friendly)] text-3xl leading-tight tracking-[-0.04em]">
              벌써 {completedCount}개를<br />잘 끝냈어요.
            </p>
            <p className="mt-4 text-sm leading-6 text-[#667168]">완벽한 하루보다 다시 돌아오는 하루가 더 오래가요.</p>
          </div>

          <div className="mt-14 space-y-5">
            {['물 2L 마시기', '책 10쪽 읽기', '자정 전에 눕기'].map((habit, index) => (
              <div key={habit} className="flex items-center justify-between border-b border-[#253027]/12 pb-4">
                <span className="text-sm">{habit}</span>
                <span className={`h-2.5 rounded-full ${index === 0 ? 'w-12 bg-[#2c9253]' : index === 1 ? 'w-8 bg-[#e0ad3d]' : 'w-5 bg-[#a7ada8]'}`} />
              </div>
            ))}
          </div>

          <button type="button" className="mt-12 flex min-h-12 w-full items-center justify-between border-t border-[#253027] pt-5 text-sm font-bold">
            습관 기록 보기 <ArrowRight size={17} />
          </button>
        </aside>
      </div>
    </section>
  );
}

function StripConcept({ tasks, completedCount, onToggle }: ConceptProps) {
  return (
    <section className="min-h-[calc(100vh-5rem)] overflow-hidden bg-[#f6e663] text-[#1d251f]">
      <header className="flex items-center justify-between border-b-2 border-[#1d251f] px-5 py-5 sm:px-10">
        <a href="#" className="text-xl font-black tracking-[-0.05em]">GrowDo</a>
        <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
          <a href="#" className="border-b-2 border-[#1d251f] pb-1">오늘</a>
          <a href="#">습관</a>
          <a href="#">목표</a>
          <a href="#">보상</a>
        </nav>
        <button type="button" aria-label="프로필"><CircleUserRound size={24} /></button>
      </header>

      <div className="grid min-h-[calc(100vh-9.5rem)] xl:grid-cols-[minmax(20rem,0.72fr)_minmax(0,1.5fr)]">
        <div className="flex flex-col justify-between border-b-2 border-[#1d251f] px-5 py-10 sm:px-10 xl:border-r-2 xl:border-b-0 xl:py-14">
          <div>
            <p className="text-xs font-bold tracking-[0.2em]">THU · AUG 14</p>
            <h1 className="mt-8 max-w-xl text-[clamp(3.5rem,8vw,8.5rem)] font-black leading-[0.84] tracking-[-0.09em]">
              오늘의<br />속도는<br />내가 정해요.
            </h1>
          </div>
          <div className="mt-16 flex items-end justify-between gap-6">
            <p className="max-w-xs text-base font-medium leading-7">네 개 중 {completedCount}개 완료. 다음 한 개만 고르면 돼요.</p>
            <span className="text-5xl font-black tracking-[-0.06em]">{completedCount}/4</span>
          </div>
        </div>

        <div className="bg-[#f4f1e7]">
          <div className="flex min-h-24 items-center justify-between border-b-2 border-[#1d251f] px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <ListTodo size={20} />
              <span className="text-sm font-bold">오늘의 액션 스트립</span>
            </div>
            <button type="button" className="grid size-12 place-items-center rounded-full bg-[#1d251f] text-[#f4f1e7]" aria-label="할 일 추가"><Plus size={20} /></button>
          </div>

          <div>
            {tasks.map((task, index) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onToggle(task.id)}
                className={`group grid min-h-32 w-full grid-cols-[3.5rem_1fr_auto] items-center gap-4 border-b-2 border-[#1d251f] px-5 text-left transition-colors sm:min-h-36 sm:grid-cols-[5rem_1fr_auto] sm:px-8 ${task.done ? 'bg-[#dce8d4]' : 'hover:bg-[#ffffff]'}`}
              >
                <span className="text-xs font-bold tabular-nums">0{index + 1}</span>
                <span>
                  <span className={`block text-xl font-bold tracking-[-0.04em] sm:text-3xl ${task.done ? 'line-through opacity-50' : ''}`}>{task.title}</span>
                  <span className="mt-2 block text-sm text-[#626a63]">{task.detail}</span>
                </span>
                <span className={`grid size-11 place-items-center rounded-full border-2 border-[#1d251f] transition-transform group-hover:translate-x-1 ${task.done ? 'bg-[#1d251f] text-white' : ''}`}>
                  {task.done ? <Check size={18} /> : <ArrowRight size={18} />}
                </span>
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2">
            <div className="border-b-2 border-[#1d251f] bg-[#cde6f1] p-6 sm:border-r-2 sm:border-b-0 sm:p-8">
              <p className="text-xs font-bold tracking-[0.18em]">WEEK RHYTHM</p>
              <div className="mt-7 flex justify-between">
                {week.map((item) => (
                  <div key={item.day} className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold">{item.day}</span>
                    <span className={`size-3 rounded-full border border-[#1d251f] ${item.done ? 'bg-[#1d251f]' : ''}`} />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#f4a67a] p-6 sm:p-8">
              <p className="text-xs font-bold tracking-[0.18em]">THIS WEEK</p>
              <div className="mt-5 flex items-end justify-between">
                <p className="text-xl font-bold">5일 루틴 도전</p>
                <p className="text-3xl font-black">3/5</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RoomsConcept({ tasks, completedCount, onToggle }: ConceptProps) {
  return (
    <section className="min-h-[calc(100vh-5rem)] bg-[#d9e1d5] p-3 text-[#26302a] sm:p-6">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[2rem] bg-[#fbf8ef] shadow-[0_24px_70px_rgba(38,48,42,0.12)]">
        <header className="flex min-h-20 items-center justify-between border-b border-[#26302a]/15 px-5 sm:px-8">
          <div className="flex items-center gap-8">
            <a href="#" className="font-[family-name:var(--font-friendly)] text-2xl font-bold">GrowDo</a>
            <span className="hidden text-sm text-[#778079] md:inline">8월 14일 목요일</span>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="hidden min-h-11 items-center gap-2 rounded-full bg-[#e9eee6] px-5 text-sm font-semibold sm:flex"><CalendarDays size={16} /> 이번 주</button>
            <button type="button" className="grid size-11 place-items-center rounded-full border border-[#26302a]/20" aria-label="메뉴"><Menu size={18} /></button>
          </div>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1.38fr)_minmax(19rem,0.62fr)]">
          <div className="p-5 sm:p-8 lg:p-12">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-semibold text-[#2e8c54]">안녕하세요, 지은님</p>
                <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-friendly)] text-4xl leading-tight tracking-[-0.06em] sm:text-6xl">
                  오늘 머물 곳을<br />가볍게 정리해뒀어요.
                </h1>
              </div>
              <button type="button" className="grid size-14 shrink-0 place-items-center rounded-full bg-[#2e8c54] text-white shadow-[0_8px_20px_rgba(46,140,84,0.2)]" aria-label="할 일 추가"><Plus size={22} /></button>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-[1.3fr_0.7fr] md:grid-rows-[auto_auto]">
              <section className="min-h-[25rem] rounded-[1.75rem] bg-[#eef0e7] p-6 sm:p-8 md:row-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold tracking-[0.16em] text-[#768078]">THE MAIN ROOM</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em]">오늘 할 일</h2>
                  </div>
                  <span className="text-sm font-semibold">{completedCount} / {tasks.length}</span>
                </div>

                <div className="mt-8 divide-y divide-[#26302a]/12">
                  {tasks.map((task) => (
                    <button key={task.id} type="button" onClick={() => onToggle(task.id)} className="group flex min-h-20 w-full items-center gap-4 text-left">
                      <span className={`grid size-8 shrink-0 place-items-center rounded-full transition-colors ${task.done ? 'bg-[#2e8c54] text-white' : 'border border-[#8e978f] bg-[#fbf8ef] group-hover:border-[#2e8c54]'}`}>
                        {task.done && <Check size={15} strokeWidth={3} />}
                      </span>
                      <span className="flex-1">
                        <span className={`block text-base font-semibold sm:text-lg ${task.done ? 'text-[#8b928c] line-through' : ''}`}>{task.title}</span>
                        <span className="mt-1 block text-xs text-[#7b837d]">{task.detail}</span>
                      </span>
                      <ChevronRight size={17} className="opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.75rem] bg-[#f4d89e] p-6">
                <p className="text-xs font-bold tracking-[0.16em] text-[#765f31]">SUNNY CORNER</p>
                <p className="mt-8 text-4xl font-black tracking-[-0.06em]">4일째</p>
                <p className="mt-2 text-sm leading-6 text-[#6d5b37]">이번 주도 내 리듬을 잘 이어가고 있어요.</p>
              </section>

              <section className="rounded-[1.75rem] bg-[#cfe6ed] p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold tracking-[0.16em] text-[#3f6873]">WINDOW VIEW</p>
                  <span className="text-xs font-semibold">주간 기록</span>
                </div>
                <div className="mt-7 flex justify-between">
                  {week.map((item) => (
                    <div key={item.day} className="text-center">
                      <span className="block text-[0.65rem] font-semibold">{item.day}</span>
                      <span className={`mt-2 block h-8 w-1.5 rounded-full ${item.done ? 'bg-[#397d8f]' : item.today ? 'bg-[#fbf8ef]' : 'bg-[#a9c5cc]'}`} />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <aside className="border-t border-[#26302a]/15 bg-[#28342d] p-6 text-[#f5f2e9] sm:p-8 lg:border-t-0 lg:border-l lg:p-10">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold tracking-[0.18em] text-[#aeb9b1]">SIDE ROOM</p>
              <span className="text-xs text-[#aeb9b1]">습관 3</span>
            </div>

            <h2 className="mt-12 font-[family-name:var(--font-friendly)] text-3xl leading-tight tracking-[-0.04em]">매일 두드리는<br />작은 문들</h2>

            <div className="mt-10 space-y-2">
              {[
                { title: '물 2L 마시기', progress: '5 / 8', width: '62%' },
                { title: '책 10쪽 읽기', progress: '10 / 10', width: '100%' },
                { title: '자정 전에 눕기', progress: '0 / 1', width: '12%' },
              ].map((habit) => (
                <button key={habit.title} type="button" className="w-full border-b border-white/12 py-5 text-left">
                  <span className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{habit.title}</span>
                    <span className="text-xs text-[#aeb9b1]">{habit.progress}</span>
                  </span>
                  <span className="mt-4 block h-1 overflow-hidden rounded-full bg-white/12">
                    <span className="block h-full rounded-full bg-[#79c995]" style={{ width: habit.width }} />
                  </span>
                </button>
              ))}
            </div>

            <button type="button" className="mt-9 flex min-h-12 w-full items-center justify-between rounded-full border border-white/30 px-5 text-sm font-semibold transition-colors hover:bg-white hover:text-[#28342d]">
              습관 모두 보기 <ArrowRight size={16} />
            </button>

            <div className="mt-14 border-t border-white/12 pt-8">
              <p className="text-xs text-[#aeb9b1]">이번 주 챌린지</p>
              <p className="mt-3 text-lg font-semibold">주 5일 루틴 완성하기</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/12"><span className="block h-full w-3/5 rounded-full bg-[#f2c66d]" /></span>
                <span className="text-sm font-bold">3 / 5</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
