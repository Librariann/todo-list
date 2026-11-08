import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const alt = 'GrowDo — 할 일, 습관, 목표를 한곳에서';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const logo = await readFile(path.join(process.cwd(), 'public/growdo-logo.png'));
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: '#263d30',
        color: '#f6f8ee',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{ display: 'flex', gap: 20, alignItems: 'center', fontSize: 40, fontWeight: 700 }}
      >
        <img
          src={`data:image/png;base64,${logo.toString('base64')}`}
          alt=""
          width={60}
          height={60}
        />
        GrowDo
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: 86,
          fontWeight: 700,
          letterSpacing: -4,
          lineHeight: 1.1,
        }}
      >
        <span>Plan today.</span>
        <span>Keep going.</span>
      </div>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', color: '#b1d6b4', fontSize: 24 }}
      >
        <span>Tasks, habits &amp; goals. One place.</span>
        <span>growdo.kr</span>
      </div>
    </div>,
    size
  );
}
