import Link from 'next/link';
import { Logo } from './Logo';
import { api } from '@/lib/api';

export async function Footer() {
  let authors: { slug: string; name: string }[] = [];
  try {
    authors = await api.authors();
  } catch {
    authors = [];
  }

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
        {authors.length > 0 ? (
          <div className="text-sm text-ink/65">
            <div className="eyebrow">Витрины</div>
            <div className="mt-3 flex flex-col gap-2">
              {authors.slice(0, 8).map((author) => (
                <Link
                  key={author.slug}
                  href={`/a/${author.slug}`}
                  className="hover:text-ink"
                >
                  {author.name}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </footer>
  );
}
