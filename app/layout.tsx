import type { Metadata } from 'next';
import { Gowun_Dodum, Noto_Sans_KR } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import Providers from './components/Providers';

const bodyFont = Noto_Sans_KR({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
});

const friendlyFont = Gowun_Dodum({
  variable: '--font-friendly',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GrowDo — 오늘도 하나씩',
  description: '할 일과 습관, 목표를 부담 없이 이어가는 나의 일상 생산성 공간.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${friendlyFont.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
