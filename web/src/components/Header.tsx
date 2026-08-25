'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { HeaderSearch } from './HeaderSearch';
import { Logo } from './Logo';

export function Header() {
  const { count, ready } = useCart();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-20 overflow-x-clip border-b border-ink/5 bg-cream/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-14 min-w-0 max-w-6xl items-center gap-1.5 px-3 md:h-[4.75rem] md:gap-4 md:px-4">
        <Logo />
        {isAdmin ? (
          <span className="ml-auto text-sm text-ink/45">Админка</span>
        ) : (
          <>
            <HeaderSearch />
            <Link
              href="/cart"
              aria-label={
                ready && count > 0 ? `Корзина, ${count}` : 'Корзина'
              }
              className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lavender-full text-white hover:bg-lavender-deep hover:shadow-soft md:h-auto md:w-auto md:gap-2 md:px-4 md:py-2.5"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden
              >
                <path
                  d="M6.5 8.5h11l-.9 9.2a1.5 1.5 0 0 1-1.5 1.3H9a1.5 1.5 0 0 1-1.5-1.3L6.5 8.5Z"
                  strokeLinejoin="round"
                />
                <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" strokeLinecap="round" />
              </svg>
              <span className="hidden text-[13px] font-semibold tracking-[0.04em] md:inline">
                Корзина{ready && count > 0 ? ` · ${count}` : ''}
              </span>
              {ready && count > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] font-semibold leading-none text-white md:hidden">
                  {count}
                </span>
              ) : null}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
