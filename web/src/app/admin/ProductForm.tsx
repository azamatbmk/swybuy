'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Product, ShopSettings, formatPrice } from '@/lib/types';
import { slugify } from '@/lib/slug';
import { ProductImage } from '@/components/ProductImage';
import { effectiveDiscount, salePrice } from '@/lib/sale';

export type ProductDraft = {
  name: string;
  sku: string;
  slug: string;
  price: number;
  discountInput: string;
  stock: number;
  weightGrams: number;
  description: string;
  ingredients: string;
  forWhom: string;
  warning: string;
  imageUrl: string;
  active: boolean;
};

function toDraft(product?: Product): ProductDraft {
  return {
    name: product?.name || '',
    sku: product?.sku || '',
    slug: product?.slug || '',
    price: product?.price ?? 0,
    discountInput:
      product?.ownDiscountPercent === null ||
      product?.ownDiscountPercent === undefined
        ? ''
        : String(product.ownDiscountPercent),
    stock: product?.stock ?? 0,
    weightGrams: product?.weightGrams ?? 200,
    description: product?.description || '',
    ingredients: product?.ingredients || '',
    forWhom: product?.forWhom || '',
    warning: product?.warning || '',
    imageUrl: product?.imageUrl || '/products/placeholder.svg',
    active: product?.active ?? true,
  };
}

export function ProductForm({
  product,
  settings,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  product?: Product;
  settings: ShopSettings;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (draft: ProductDraft) => void;
}) {
  const [draft, setDraft] = useState(() => toDraft(product));
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [skuTouched, setSkuTouched] = useState(Boolean(product));
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstField.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function set<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit(draft);
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-ink/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(event) => event.stopPropagation()}
        className="my-8 w-full max-w-2xl space-y-3 rounded-2xl bg-white p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold">
            {product ? 'Редактировать товар' : 'Новая карточка'}
          </h3>
          <button type="button" onClick={onClose} className="text-sm text-ink/50">
            Закрыть
          </button>
        </div>

        <label className="block text-sm">
          Название
          <input
            required
            minLength={2}
            value={draft.name}
            ref={firstField}
            onChange={(event) => {
              const name = event.target.value;
              set('name', name);
              if (!slugTouched) {
                set('slug', slugify(name));
              }
              if (!skuTouched) {
                set('sku', slugify(name).replace(/-/g, '').slice(0, 16) || 'sku');
              }
            }}
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Артикул
            <input
              required
              value={draft.sku}
              onChange={(event) => {
                setSkuTouched(true);
                set('sku', event.target.value);
              }}
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Ссылка
            <input
              required
              value={draft.slug}
              onChange={(event) => {
                setSlugTouched(true);
                set('slug', event.target.value);
              }}
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            />
            <span className="mt-1 block text-xs text-ink/40">
              Карточка откроется как /p/{draft.slug || 'slug'}
            </span>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm">
            Цена, ₽
            <input
              type="number"
              min={0}
              required
              value={draft.price}
              onChange={(event) => set('price', Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            />
            <span className="mt-1 block text-xs text-ink/40">Обычная цена</span>
          </label>
          <label className="text-sm">
            Скидка, %
            <input
              type="number"
              min={0}
              max={90}
              value={draft.discountInput}
              onChange={(event) => set('discountInput', event.target.value)}
              placeholder="как у всех"
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            />
            <span className="mt-1 block text-xs text-ink/40">
              Пусто — общая скидка. 0 — без скидки.
            </span>
          </label>
          <div className="text-sm">
            Новая цена
            <div className="mt-1 rounded-xl border border-stone-200 px-3 py-2">
              {formatPrice(
                salePrice(
                  Number.isFinite(draft.price) ? draft.price : 0,
                  effectiveDiscount(
                    draft.discountInput.trim() === ''
                      ? null
                      : Number.isFinite(Number(draft.discountInput))
                        ? Number(draft.discountInput)
                        : undefined,
                    settings,
                  ),
                ),
              )}
            </div>
          </div>
          <label className="text-sm">
            Остаток
            <input
              type="number"
              min={0}
              required
              value={draft.stock}
              onChange={(event) => set('stock', Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Вес, г
            <input
              type="number"
              min={1}
              value={draft.weightGrams}
              onChange={(event) => set('weightGrams', Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            />
          </label>
        </div>

        <label className="block text-sm">
          Фото
          <input
            required
            pattern="/products/[A-Za-z0-9._-]+\.(jpg|jpeg|png|webp|svg|gif)"
            value={draft.imageUrl}
            onChange={(event) => set('imageUrl', event.target.value)}
            placeholder="/products/имя.jpg"
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
          />
          <span className="mt-1 block text-xs text-ink/40">
            Положите файл в web/public/products/ и укажите /products/имя.jpg.
            Ссылки на Unsplash отсюда не открываются.
          </span>
        </label>
        {draft.imageUrl ? (
          <ProductImage
            src={draft.imageUrl}
            alt=""
            className="h-32 w-32 rounded-xl object-cover"
          />
        ) : null}

        <label className="block text-sm">
          Описание
          <textarea
            required
            minLength={2}
            rows={3}
            value={draft.description}
            onChange={(event) => set('description', event.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Состав
          <textarea
            rows={4}
            value={draft.ingredients}
            onChange={(event) => set('ingredients', event.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Кому подойдёт
          <input
            value={draft.forWhom}
            onChange={(event) => set('forWhom', event.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Пометка / предупреждение
          <input
            value={draft.warning}
            onChange={(event) => set('warning', event.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.active}
            onChange={(event) => set('active', event.target.checked)}
          />
          Показывать на витрине
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          disabled={saving}
          className="w-full rounded-full bg-lavender-full py-3 font-medium text-white disabled:opacity-60"
        >
          {saving ? 'Сохраняем…' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
}
