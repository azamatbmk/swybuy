import Link from 'next/link';
import { formatPrice } from '@/lib/types';
import { FREE_DELIVERY_FROM } from '@/lib/shop';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-ink/5">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/55">
            Уход со склада. То, что показывают в обзорах, можно заказать сразу —
            отправка за 1–2 дня.
          </p>
        </div>
        <div className="text-sm text-ink/65">
          <div className="eyebrow">Доставка</div>
          <p className="mt-3">СДЭК по России, 350 ₽</p>
          <p>Бесплатно от {formatPrice(FREE_DELIVERY_FROM)}</p>
        </div>
        <div className="text-sm text-ink/65">
          <div className="eyebrow">Авторы</div>
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/a/masha" className="hover:text-ink">
              Витрина Маши
            </Link>
            <Link href="/a/anna" className="hover:text-ink">
              Витрина Анны
            </Link>
            <Link href="/a/lina" className="hover:text-ink">
              Витрина Лины
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
