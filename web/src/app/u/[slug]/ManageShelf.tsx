'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { readShelfToken } from '@/lib/shelf-token';
import { Product } from '@/lib/types';

export function ManageShelf({
  slug,
  products,
}: {
  slug: string;
  products: Product[];
}) {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [selected, setSelected] = useState(products.map((item) => item.sku));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  useEffect(() => {
    setToken(readShelfToken(slug));
    setSelected(products.map((item) => item.sku));
  }, [products, slug]);

  if (!token) {
    return null;
  }

  async function hide(sku: string) {
    const next = selected.filter((item) => item !== sku);
    setSelected(next);
    setSaving(true);
    setError('');
    setOk(false);
    try {
      await api.updateShelf(slug, { token, skus: next });
      setOk(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось скрыть');
      setSelected(selected);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl bg-lavender/30 px-4 py-3 text-sm">
      <p className="text-ink/70">Это ваша полка. Можно скрыть средство.</p>
      {products.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {products.map((product) => (
            <button
              key={product.sku}
              type="button"
              disabled={saving}
              onClick={() => hide(product.sku)}
              className="rounded-full bg-white px-3 py-1 text-xs text-ink/70 hover:text-ink"
            >
              Скрыть · {product.name.split(' ').slice(0, 4).join(' ')}
            </button>
          ))}
        </div>
      ) : null}
      {error ? <p className="mt-2 text-red-600">{error}</p> : null}
      {ok ? <p className="mt-2 text-ink/55">Сохранили.</p> : null}
    </div>
  );
}
