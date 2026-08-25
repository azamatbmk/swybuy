import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="mt-12 border-t border-ink/5 pb-[env(safe-area-inset-bottom)] md:mt-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/55">
            Уход со склада. То, что показывают в обзорах, можно заказать сразу —
            по Северной Осетии доставка в день покупки бесплатно.
          </p>
        </div>
        <div className="text-sm text-ink/65">
          <div className="eyebrow">Доставка</div>
          <p className="mt-3">По Северной Осетии — в день покупки, бесплатно</p>
          <p>Только по республике</p>
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
