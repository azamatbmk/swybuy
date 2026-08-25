import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { api } from '@/lib/api';
import { ManageShelf } from './ManageShelf';

export default async function ShelfPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const shelf = await api.shelf(slug);

    return (
      <div className="space-y-10">
        <section className="max-w-xl">
          <p className="eyebrow">Полка</p>
          <h1 className="mt-3 text-4xl font-medium md:text-6xl">
            {shelf.name} показывает, что берёт
          </h1>
          <p className="mt-4 text-ink/60">
            Это набор со склада. Можно взять то же самое.
          </p>
        </section>

        <Suspense>
          <ManageShelf slug={shelf.slug} products={shelf.products} />
        </Suspense>

        {shelf.products.length === 0 ? (
          <p className="text-ink/55">Пока ничего не выложено.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {shelf.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    );
  } catch {
    notFound();
  }
}
