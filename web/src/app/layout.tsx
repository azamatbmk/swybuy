import type { Metadata } from 'next';
import { Jost, Poiret_One } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

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

export const metadata: Metadata = {
  title: 'SwyBuy — See what you buy',
  description:
    'See what you buy. Уход со склада, отправка за 1–2 дня, бесплатная доставка от 2 500 ₽.',
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
        <CartProvider>
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
