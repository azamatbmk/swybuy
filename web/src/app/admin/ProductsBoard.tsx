'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Product, formatPrice } from '@/lib/types';
import { ProductDraft, ProductForm } from './ProductForm';

export function ProductsBoard({
  products,
  setProducts,
}: {
  products: Product[];
  setProducts: (update: (current: Product[]) => Product[]) => void;
}) {
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState<Product | 'new' | null>(null);

  async function patch(
    id: string,
    body: { price?: number; stock?: number; active?: boolean },
  ) {
    setError('');
    try {
      const updated = await api.updateProduct(id, body);
      setProducts((current) =>
        current.map((row) => (row.id === id ? updated : row)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить товар');
    }
  }

  async function save(draft: ProductDraft) {
    setFormError('');
    setSaving(true);
    try {
      if (editor === 'new') {
        const created = await api.createProduct(draft);
        setProducts((current) =>
          [...current, created].sort((a, b) => a.name.localeCompare(b.name, 'ru')),
        );
      } else if (editor) {
        const updated = await api.updateProduct(editor.id, draft);
        setProducts((current) =>
          current.map((row) => (row.id === editor.id ? updated : row)),
        );
      }
      setEditor(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-medium">Товары</h2>
          <p className="mt-1 text-sm text-ink/55">
            Остатки × цена, все карточки:{' '}
            {formatPrice(
              products.reduce(
                (sum, item) => sum + item.price * item.stock,
                0,
              ),
            )}
          </p>
        </div>
        <button
          onClick={() => {
            setFormError('');
            setEditor('new');
          }}
          className="rounded-full bg-lavender-full px-4 py-2 text-sm text-white"
        >
          Добавить карточку
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-4 space-y-3">
        {products.map((product) => (
          <article
            key={product.id}
            className={`grid gap-3 rounded-2xl bg-white p-4 text-sm md:grid-cols-12 ${
              product.active ? '' : 'opacity-60'
            }`}
          >
            <div className="md:col-span-4">
              <div className="font-medium">{product.name}</div>
              <div className="text-ink/50">
                {product.sku} · {formatPrice(product.price)}
              </div>
            </div>
            <label className="md:col-span-2">
              Цена
              <input
                type="number"
                min={0}
                defaultValue={product.price}
                className="mt-1 w-full rounded-lg border border-stone-200 px-2 py-1"
                onBlur={(event) => {
                  const price = Number(event.target.value);
                  if (Number.isNaN(price) || price === product.price) {
                    return;
                  }
                  patch(product.id, { price });
                }}
              />
            </label>
            <label className="md:col-span-2">
              Остаток
              <input
                type="number"
                min={0}
                defaultValue={product.stock}
                className={`mt-1 w-full rounded-lg border px-2 py-1 ${
                  product.stock <= 3 ? 'border-red-300' : 'border-stone-200'
                }`}
                onBlur={(event) => {
                  const stock = Number(event.target.value);
                  if (Number.isNaN(stock) || stock === product.stock) {
                    return;
                  }
                  patch(product.id, { stock });
                }}
              />
            </label>
            <label className="flex items-center gap-2 md:col-span-2 md:pt-5">
              <input
                type="checkbox"
                checked={product.active}
                onChange={(event) =>
                  patch(product.id, { active: event.target.checked })
                }
              />
              {product.active ? 'На витрине' : 'Скрыт'}
            </label>
            <div className="flex items-end md:col-span-2">
              <button
                onClick={() => {
                  setFormError('');
                  setEditor(product);
                }}
                className="text-sm text-lavender-full"
              >
                Изменить
              </button>
            </div>
          </article>
        ))}
      </div>

      {editor ? (
        <ProductForm
          product={editor === 'new' ? undefined : editor}
          saving={saving}
          error={formError}
          onClose={() => setEditor(null)}
          onSubmit={save}
        />
      ) : null}
    </section>
  );
}
