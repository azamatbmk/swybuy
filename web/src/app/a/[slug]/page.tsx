import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Catalog } from '@/components/Catalog';
import { RoutineCards } from '@/components/RoutineCards';
import { TrustBar } from '@/components/TrustBar';
import { api } from '@/lib/api';
import { ROUTINES, productsBySkus } from '@/lib/shop';

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const author = await api.author(slug);
    const products = author.products || [];
    const label = author.name.startsWith('@')
      ? author.name
      : author.handle
        ? `@${author.handle}`
        : author.name;

    return (
      <div className="space-y-10 md:space-y-16">
        <section className="card px-5 py-8 md:px-12 md:py-14">
          <p className="eyebrow">Витрина {label}</p>
          <h1 className="mt-3 max-w-xl text-[2rem] font-medium leading-tight text-balance md:mt-4 md:text-6xl">
            Каталог, который показывает {label}
          </h1>
          <p className="mt-5 max-w-xl text-ink/65">
            Средства со склада SwyBuy. Можно заказать сразу. По Северной Осетии
            доставка в день покупки бесплатно.
          </p>
        </section>

        <TrustBar />

        {ROUTINES.some((routine) => productsBySkus(products, routine.skus).length > 0) ? (
          <section>
            <p className="eyebrow">С чего начать</p>
            <h2 className="mt-3 text-[2rem] font-medium md:text-4xl">Наборы</h2>
            <div className="mt-8">
              <RoutineCards products={products} refSlug={author.slug} />
            </div>
          </section>
        ) : null}

        <section id="catalog">
          <p className="eyebrow">Каталог</p>
          <h2 className="mt-3 text-[2rem] font-medium md:text-4xl">Средства</h2>
          <div className="mt-8">
            <Suspense>
              <Catalog products={products} refSlug={author.slug} />
            </Suspense>
          </div>
        </section>
      </div>
    );
  } catch {
    notFound();
  }
}
