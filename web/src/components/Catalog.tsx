'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/lib/types';
import { searchProducts } from '@/lib/search';
import { ProductCard } from './ProductCard';

export function Catalog({
  products,
  refSlug,
}: {
  products: Product[];
  refSlug?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const visible = searchProducts(products, query);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next = query.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set('q', next);
    } else {
      params.delete('q');
    }
    const suffix = params.toString();
    router.replace(`${pathname}${suffix ? `?${suffix}` : ''}#catalog`, {
      scroll: false,
    });
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="max-w-xl">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Найти: пдрн, церамиды, жирная кожа…"
          className="field"
        />
      </form>
      <p className="mt-3 text-sm text-ink/45">
        {query.trim()
          ? `${visible.length} из ${products.length}`
          : refSlug
            ? `${products.length} средств в подборке`
            : `${products.length} средств на складе`}
      </p>
      {visible.length === 0 ? (
        <p className="card mt-6 px-6 py-10 text-ink/55">
          Ничего не нашлось. Попробуйте «пдрн», «крем» или тип кожи.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 items-stretch gap-3 md:grid-cols-3 md:gap-6">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} refSlug={refSlug} />
          ))}
        </div>
      )}
    </div>
  );
}
