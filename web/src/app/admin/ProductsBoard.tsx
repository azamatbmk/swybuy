'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Product, ShopSettings, formatPrice, sellingPrice } from '@/lib/types';
import { ProductDraft, ProductForm } from './ProductForm';
import { clampPercent } from '@/lib/sale';

export function ProductsBoard({
  products,
  settings,
  setProducts,
  setSettings,
}: {
  products: Product[];
  settings: ShopSettings;
  setProducts: (update: (current: Product[]) => Product[]) => void;
  setSettings: (next: ShopSettings) => void;
}) {
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState<Product | 'new' | null>(null);
  const [globalOn, setGlobalOn] = useState(settings.globalDiscountOn);
  const [globalPercent, setGlobalPercent] = useState(
    String(settings.globalDiscountPercent),
  );
  const [savingSale, setSavingSale] = useState(false);

  useEffect(() => {
    setGlobalOn(settings.globalDiscountOn);
    setGlobalPercent(String(settings.globalDiscountPercent));
  }, [settings]);

  async function patch(
    id: string,
    body: {
      price?: number;
      stock?: number;
      active?: boolean;
      discountPercent?: number | null;
    },
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

  async function persistSale(on: boolean, percentRaw: string) {
    setError('');
    setSavingSale(true);
    try {
      const next = await api.updateSettings({
        globalDiscountOn: on,
        globalDiscountPercent: clampPercent(Number(percentRaw)),
      });
      setSettings(next);
      setGlobalOn(next.globalDiscountOn);
      setGlobalPercent(String(next.globalDiscountPercent));
      const refreshed = await api.adminProducts();
      setProducts(() => refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить скидку');
    } finally {
      setSavingSale(false);
    }
  }

  async function save(draft: ProductDraft) {
    setFormError('');
    const { discountInput, ...rest } = draft;
    const parsed =
      discountInput.trim() === '' ? null : Number(discountInput);
    if (parsed !== null && (!Number.isFinite(parsed) || parsed < 0 || parsed > 90)) {
      setFormError('Скидка — число от 0 до 90, либо пусто');
      return;
    }
    setSaving(true);
    const body = {
      ...rest,
      discountPercent: parsed,
    };
    try {
      if (editor === 'new') {
        const created = await api.createProduct(body);
        setProducts((current) =>
          [...current, created].sort((a, b) => a.name.localeCompare(b.name, 'ru')),
        );
      } else if (editor) {
        const updated = await api.updateProduct(editor.id, body);
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
            Остатки × цена продажи:{' '}
            {formatPrice(
              products.reduce(
                (sum, item) => sum + sellingPrice(item) * item.stock,
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

      <div className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={globalOn}
            disabled={savingSale}
            onChange={(event) => {
              const on = event.target.checked;
              setGlobalOn(on);
              void persistSale(on, globalPercent);
            }}
          />
          Скидка на все товары
        </label>
        <label>
          %
          <input
            type="number"
            min={0}
            max={90}
            value={globalPercent}
            disabled={savingSale}
            onChange={(event) => setGlobalPercent(event.target.value)}
            onBlur={() => {
              const nextPercent = clampPercent(Number(globalPercent));
              if (
                globalOn === settings.globalDiscountOn &&
                nextPercent === settings.globalDiscountPercent
              ) {
                setGlobalPercent(String(nextPercent));
                return;
              }
              void persistSale(globalOn, globalPercent);
            }}
            className="ml-2 w-20 rounded-lg border border-stone-200 px-2 py-1"
          />
        </label>
        <button
          type="button"
          disabled={savingSale}
          onClick={() => void persistSale(globalOn, globalPercent)}
          className="rounded-full bg-lavender-full px-4 py-2 text-white disabled:opacity-60"
        >
          {savingSale ? 'Сохраняем…' : 'Применить'}
        </button>
        <p className="w-full text-xs text-ink/45">
          У товара можно поставить свою скидку. Пустое поле — как у всех, 0 — без
          скидки.
        </p>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-4 space-y-3">
        {products.map((product) => (
          <article
            key={`${product.id}-${product.price}-${String(product.ownDiscountPercent)}-${product.salePrice}`}
            className={`grid gap-3 rounded-2xl bg-white p-4 text-sm md:grid-cols-12 ${
              product.active ? '' : 'opacity-60'
            }`}
          >
            <div className="md:col-span-3">
              <div className="font-medium">{product.name}</div>
              <div className="text-ink/50">
                {product.sku}
                {product.discountPercent
                  ? ` · −${product.discountPercent}%`
                  : ''}
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
              Скидка %
              <input
                type="number"
                min={0}
                max={90}
                placeholder="как у всех"
                defaultValue={
                  product.ownDiscountPercent === null ||
                  product.ownDiscountPercent === undefined
                    ? ''
                    : product.ownDiscountPercent
                }
                className="mt-1 w-full rounded-lg border border-stone-200 px-2 py-1"
                onBlur={(event) => {
                  const raw = event.target.value.trim();
                  const next = raw === '' ? null : Number(raw);
                  const current = product.ownDiscountPercent ?? null;
                  if (
                    next !== null &&
                    (!Number.isFinite(next) || next < 0 || next > 90)
                  ) {
                    setError('Скидка — число от 0 до 90, либо пусто');
                    return;
                  }
                  if (next === current) {
                    return;
                  }
                  patch(product.id, { discountPercent: next });
                }}
              />
            </label>
            <div className="md:col-span-2 md:pt-5">
              {product.discountPercent ? (
                <span>
                  <span className="text-ink/40 line-through">
                    {formatPrice(product.price)}
                  </span>{' '}
                  {formatPrice(sellingPrice(product))}
                </span>
              ) : (
                formatPrice(product.price)
              )}
            </div>
            <label className="md:col-span-1">
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
            <label className="flex items-center gap-2 md:col-span-1 md:pt-5">
              <input
                type="checkbox"
                checked={product.active}
                onChange={(event) =>
                  patch(product.id, { active: event.target.checked })
                }
              />
              {product.active ? 'На витрине' : 'Скрыт'}
            </label>
            <div className="flex items-end md:col-span-1">
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
          settings={settings}
          saving={saving}
          error={formError}
          onClose={() => setEditor(null)}
          onSubmit={save}
        />
      ) : null}
    </section>
  );
}
