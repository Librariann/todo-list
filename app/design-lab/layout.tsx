import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

interface DesignLabLayoutProps {
  children: ReactNode;
}

export default function DesignLabLayout({ children }: DesignLabLayoutProps) {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return children;
}
