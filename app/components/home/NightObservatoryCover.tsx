import motionStyles from './ThemeMotion.module.css';

interface NightObservatoryCoverProps {
  date: string;
  username?: string;
  headingAs?: 'h1' | 'h3';
}

export function LunarChart() {
  return (
    <svg viewBox="0 0 420 270" aria-hidden="true" className="block w-full">
      <g fill="none" stroke="#637a87" strokeWidth="0.7">
        <path d="M3 135h414M233 3v264M107 9v252M358 9v252M12 54h395M12 216h395" opacity=".54" />
        <circle cx="233" cy="135" r="126" strokeDasharray="1 5" />
        <circle cx="233" cy="135" r="104" />
        <circle cx="233" cy="135" r="80" strokeDasharray="4 5" />
        <ellipse cx="233" cy="135" rx="161" ry="53" transform="rotate(-29 233 135)" />
        <path d="m107 54 251 162m0-162L107 216" strokeDasharray="2 6" opacity=".55" />
      </g>
      <g fill="none" stroke="#e5c686" strokeWidth="1">
        <path d="M20 79V35h44m310 156v44h-44M233 9v10m0 232v10M107 135h10m232 0h10" />
        <path d="M82 200a161 53-29 0 0 302-130" opacity=".57" />
      </g>
      <g fill="#e5c686">
        <circle cx="92" cy="74" r="2.2" />
        <circle cx="143" cy="106" r="2" />
        <circle cx="176" cy="71" r="2.7" />
        <circle cx="342" cy="172" r="2.2" />
        <circle cx="374" cy="136" r="2" />
        <circle cx="392" cy="178" r="2.9" />
      </g>
      <path
        d="m92 74 51 32 33-35m166 101 32-36 18 42"
        fill="none"
        stroke="#e5c686"
        strokeWidth=".7"
        opacity=".6"
      />
      <g fill="#f9e1ad">
        <path className={motionStyles.nightStar} d="M103 101l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" />
        <path className={motionStyles.nightStar} d="M330 87l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" />
        <path className={motionStyles.nightStar} d="M360 199l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5Z" />
      </g>
      <circle className={motionStyles.moonHalo} cx="233" cy="135" r="72" fill="none" stroke="#efd59e" strokeWidth="3" />
      <circle cx="233" cy="135" r="62" fill="#2d3b46" stroke="#d7b77a" strokeWidth=".8" />
      <path d="M233 73a62 62 0 1 1 0 124c30-15 44-39 44-62s-14-47-44-62Z" fill="#efd59e" />
      <g fill="#d6b77d" opacity=".68">
        <ellipse cx="274" cy="101" rx="8" ry="4" transform="rotate(44 274 101)" />
        <ellipse cx="285" cy="152" rx="6" ry="9" transform="rotate(19 285 152)" />
        <circle cx="269" cy="172" r="4" />
        <circle cx="287" cy="128" r="2.5" />
      </g>
      <g fill="none" stroke="#a4a99b" strokeWidth=".7" opacity=".62">
        <circle cx="215" cy="117" r="12" />
        <circle cx="212" cy="115" r="7" />
        <circle cx="195" cy="146" r="5" />
        <path d="M224 163c15 5 22 0 26-12m-32 17c15 8 28 7 34-6" />
      </g>
    </svg>
  );
}

export default function NightObservatoryCover({ date, username, headingAs: Heading = 'h1' }: NightObservatoryCoverProps) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(5rem,35%)] items-center gap-1 pt-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,42%)] sm:gap-5 sm:pt-6">
      <div className="min-w-0">
        <time
          dateTime={date}
          className="text-xs font-semibold tracking-[0.13em] text-[#e9cb8e] tabular-nums sm:text-sm"
        >
          {date.replaceAll('-', '.')}
        </time>
        <Heading className="mt-2 text-[clamp(2.05rem,5.8vw,5.2rem)] leading-[1.05] font-black tracking-[-0.075em]">
          <span className="block">밤의</span>
          <span className="block break-keep">관측 일지</span>
        </Heading>
        <p className="mt-3 line-clamp-2 text-sm leading-6 break-keep text-[#d2d4c8] [overflow-wrap:anywhere] sm:mt-5 sm:text-base">
          {username ? `${username}님의 하루를 기록해요.` : '하루의 작은 변화를 기록해요.'}
        </p>
      </div>
      <div className="w-full min-w-0 max-w-[27rem] self-center justify-self-end" aria-hidden="true">
        <LunarChart />
      </div>
    </div>
  );
}
