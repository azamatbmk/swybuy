'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { HeaderSearch } from './HeaderSearch';
import { Logo } from './Logo';

export function Header() {
  const { count } = useCart();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-20 border-b border-ink/5 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex h-[4.75rem] max-w-6xl items-center gap-4 px-4">
        <Logo />
        {isAdmin ? (
          <span className="ml-auto text-sm text-ink/45">Админка</span>
        ) : (
          <>
            <HeaderSearch />
            <nav className="ml-auto flex items-center gap-6 text-[13px] font-medium tracking-[0.04em] text-ink/70">
              <Link href="/#catalog" className="hidden hover:text-ink md:inline">
                Каталог
              </Link>
              <Link href="/cart" className="btn btn-primary px-4 py-2">
                Корзина{count > 0 ? ` · ${count}` : ''}
              </Link>
            </nav>
          </>
        )}
      </div>
    </header>
  );
}
