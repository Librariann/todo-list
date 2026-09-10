import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface LegalLayoutProps {
  title: string;
  effectiveDate: string;
  children: ReactNode;
}

export default function LegalLayout({ title, effectiveDate, children }: LegalLayoutProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          돌아가기
        </Link>

        <header className="mt-6 border-b border-stone-200 pb-6 dark:border-white/10">
          <p className="journal-kicker">GrowDo</p>
          <h1 className="friendly-heading mt-2 text-3xl font-bold text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">시행일 {effectiveDate}</p>
        </header>

        <div className="legal-body mt-8 space-y-8 text-sm leading-7 text-foreground">{children}</div>

        <footer className="mt-14 border-t border-stone-200 pt-6 text-xs text-muted-foreground dark:border-white/10">
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              이용약관
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="friendly-heading text-lg font-bold text-foreground">{heading}</h2>
      <div className="mt-3 space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}

export function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200 dark:border-white/10">
            {head.map((cell) => (
              <th key={cell} className="py-2 pr-4 font-semibold text-foreground">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join()} className="border-b border-stone-100 dark:border-white/[0.06]">
              {row.map((cell) => (
                <td key={cell} className="py-2 pr-4 align-top text-muted-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
