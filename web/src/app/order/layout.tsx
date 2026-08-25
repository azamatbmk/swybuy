import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<p className="text-ink/50">Загружаем…</p>}>{children}</Suspense>;
}
