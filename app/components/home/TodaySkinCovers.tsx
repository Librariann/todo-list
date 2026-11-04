interface SkinCoverProps {
  date: string;
}

export function CoastCover({ date }: SkinCoverProps) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_36%] items-center gap-2 pt-4 sm:grid-cols-[minmax(0,1fr)_48%] sm:gap-6 sm:pt-5">
      <div className="min-w-0 pb-2 sm:pb-4">
        <time
          dateTime={date}
          className="inline-block rounded-full border border-current/30 px-2.5 py-1 text-xs font-semibold tabular-nums"
        >
          {date.replaceAll('-', '.')}
        </time>
        <h1 className="friendly-heading mt-3 text-[clamp(2.15rem,5.3vw,5rem)] leading-[1.05] font-bold tracking-[-0.06em]">
          <span className="block">오늘도,</span>
          <span className="block break-keep">한 걸음.</span>
        </h1>
        <p className="mt-3 text-sm leading-6 break-keep opacity-90 sm:mt-4 sm:text-base">
          서두르지 말고, 내 속도로 기록해요.
        </p>
      </div>
      <svg
        viewBox="0 0 480 246"
        aria-hidden="true"
        className="w-full self-end overflow-visible sm:max-h-[15.5rem]"
      >
        <circle cx="332" cy="79" r="48" fill="var(--coast-sun)" />
        <path d="M0 141c81-16 112-36 183-18 102 25 188-25 297-9v132H0Z" fill="var(--coast-water)" />
        <path
          d="M0 174c98 11 141-24 237-20 71 3 152 25 243 0v92H0Z"
          fill="var(--coast-water-near)"
        />
        <path d="M0 202c86 19 159-6 231-11 93-6 159 23 249 6v49H0Z" fill="var(--coast-sand)" />
        <g fill="none" stroke="var(--coast-foam)" strokeWidth="2.5" strokeLinecap="round">
          <path d="M27 153c42 1 73-10 113-15m154 38c47 2 91 9 141-4M105 212c64-5 101-19 168-16" />
          <path d="M205 140h37m-40 17h72" opacity=".65" />
        </g>
        <path
          d="M0 227c105 2 125-7 191-9 77-2 108 9 183 4 33-2 69-7 106-6"
          fill="none"
          stroke="var(--coast-trail)"
          strokeWidth="2"
          strokeDasharray="4 6"
        />
      </svg>
    </div>
  );
}

export function StudioCover({ date }: SkinCoverProps) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_38%] items-center gap-2 pt-4 sm:grid-cols-[minmax(0,1fr)_44%] sm:gap-8 sm:pt-5">
      <div className="min-w-0">
        <time
          dateTime={date}
          className="text-xs font-black tracking-[0.14em] tabular-nums sm:text-sm"
        >
          {date.replaceAll('-', '.')}
        </time>
        <h1 className="mt-2 text-[clamp(2.25rem,6.4vw,5.4rem)] leading-[0.98] font-black tracking-[-0.085em]">
          <span className="block">오늘의</span>
          <span className="block">리듬</span>
        </h1>
        <p className="mt-4 border-l-2 border-current pl-2 text-sm font-semibold break-keep sm:mt-5 sm:text-base">
          할 일을 한 트랙씩 끝내요.
        </p>
      </div>
      <svg
        viewBox="0 0 440 274"
        aria-hidden="true"
        className="w-full justify-self-end sm:max-h-[16rem]"
      >
        <path d="M12 23h213v228H12z" fill="#f8e6b6" stroke="#2e2528" strokeWidth="3" />
        <path d="M14 198 177 24h39L14 239Zm37 52L224 68v29L81 250Z" fill="#ee8b6e" />
        <path d="M28 41h75m-75 13h52m-52 13h29" fill="none" stroke="#3b2b2d" strokeWidth="3" />
        <circle cx="284" cy="136" r="129" fill="#2e2528" stroke="#1f1a1b" strokeWidth="3" />
        <g fill="none" stroke="#68565a" strokeWidth="1.3">
          <circle cx="284" cy="136" r="118" />
          <circle cx="284" cy="136" r="111" />
          <circle cx="284" cy="136" r="101" />
          <circle cx="284" cy="136" r="92" />
          <circle cx="284" cy="136" r="81" />
          <circle cx="284" cy="136" r="73" />
          <circle cx="284" cy="136" r="65" />
        </g>
        <path
          d="M200 54a117 117 0 0 1 86-36m81 200a116 116 0 0 1-83 36"
          fill="none"
          stroke="#8d767b"
          strokeWidth="2"
        />
        <circle cx="284" cy="136" r="56" fill="#f09a7a" />
        <circle
          cx="284"
          cy="136"
          r="42"
          fill="none"
          stroke="#39292d"
          strokeWidth="2"
          strokeDasharray="2 5"
        />
        <path d="M244 129h80v14h-80z" fill="#f9dfaa" />
        <circle cx="284" cy="136" r="7" fill="#2e2528" />
      </svg>
    </div>
  );
}
