import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Catalog } from '@/components/Catalog';
import { RoutineCards } from '@/components/RoutineCards';
import { TrustBar } from '@/components/TrustBar';
import { api } from '@/lib/api';

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const [author, products] = await Promise.all([
      api.author(slug),
      api.products(),
    ]);

    return (
      <div className="space-y-16">
        <section className="card px-6 py-10 md:px-12 md:py-14">
          <p className="eyebrow">Подборка {author.name}</p>
          <h1 className="mt-4 max-w-xl text-5xl font-medium md:text-6xl">
            Каталог, который показывает {author.name}
          </h1>
          <p className="mt-5 max-w-xl text-ink/65">
            Найдите средство и закажите со склада. Отправка за 1–2 дня.
          </p>
        </section>

        <TrustBar />

        <section>
          <p className="eyebrow">С чего начать</p>
          <h2 className="mt-3 text-4xl font-medium">Наборы</h2>
          <div className="mt-8">
            <RoutineCards products={products} refSlug={author.slug} />
          </div>
        </section>

        <section id="catalog">
          <p className="eyebrow">Каталог</p>
          <h2 className="mt-3 text-4xl font-medium">Средства</h2>
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
