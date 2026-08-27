import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Jost, Poiret_One } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { YandexMetrika } from '@/components/YandexMetrika';

const sans = Jost({
  subsets: ['latin', 'cyrillic'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Poiret_One({
  subsets: ['latin', 'cyrillic'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'SwyBuy — See what you buy',
  description:
    'See what you buy. Уход со склада, по Северной Осетии доставка в день покупки бесплатно.',
  referrer: 'strict-origin-when-cross-origin',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${sans.variable} ${display.variable} font-sans min-h-screen bg-cream text-ink antialiased`}
      >
        <Suspense>
          <YandexMetrika />
        </Suspense>
        <CartProvider>
          <Header />
          <main className="mx-auto min-w-0 max-w-6xl px-4 py-6 md:py-10">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
