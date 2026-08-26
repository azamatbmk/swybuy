'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DeliveryHint } from '@/components/DeliveryHint';
import { ProductCard } from '@/components/ProductCard';
import { ProductImage } from '@/components/ProductImage';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { cartUpsells, deliveryPrice } from '@/lib/shop';
import { Product, formatPrice } from '@/lib/types';

export default function CartPage() {
  const { items, setQuantity, remove, total, ready, syncFromCatalog } = useCart();
  const [catalog, setCatalog] = useState<Product[]>([]);

  useEffect(() => {
    api
      .products()
      .then((products) => {
        setCatalog(products);
        syncFromCatalog(products);
      })
      .catch(() => setCatalog([]));
  }, [syncFromCatalog]);

  const shipping = deliveryPrice(total);
  const listTotal = items.reduce(
    (sum, item) => sum + (item.listPrice ?? item.price) * item.quantity,
    0,
  );
  const saved = listTotal - total;
  const upsells = cartUpsells(
    items.map((item) => item.sku),
    catalog,
  );

  if (!ready) {
    return <p className="text-ink/50">Загружаем корзину…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="space-y-10">
        <div className="card px-5 py-12 text-center md:px-8 md:py-16">
          <h1 className="text-3xl font-medium md:text-4xl">Корзина пуста</h1>
          <p className="mt-3 text-pretty text-ink/55">
            Соберите утро или добавьте одно средство.
          </p>
          <Link href="/" className="btn btn-primary mt-6">
            К витрине
          </Link>
        </div>
        {catalog.length > 0 ? (
          <div className="grid grid-cols-2 items-stretch gap-3 md:grid-cols-3 md:gap-6">
            {catalog.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow">Заказ</p>
        <h1 className="mt-2 text-4xl font-medium md:text-5xl">Корзина</h1>
      </div>
      <DeliveryHint />
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.sku} className="card flex gap-3 p-3 md:items-center md:gap-4 md:p-4">
            <ProductImage
              src={item.imageUrl}
              alt={item.name}
              className="h-16 w-16 shrink-0 rounded-2xl object-cover md:h-20 md:w-20"
            />
            <div className="min-w-0 flex-1">
              <Link href={`/p/${item.slug}`} className="line-clamp-2 font-medium">
                {item.name}
              </Link>
              <div className="text-sm">
                {item.listPrice != null && item.listPrice > item.price ? (
                  <>
                    <span className="text-ink/40 line-through">
                      {formatPrice(item.listPrice)}
                    </span>{' '}
                    <span className="text-ink">{formatPrice(item.price)}</span>
                  </>
                ) : (
                  <span className="text-ink/50">{formatPrice(item.price)}</span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={item.stock}
                  value={item.quantity}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === '') {
                      return;
                    }
                    setQuantity(item.sku, Number(value));
                  }}
                  className="field h-11 w-16 py-2"
                />
                <button
                  onClick={() => remove(item.sku)}
                  className="min-h-11 text-sm text-ink/40 hover:text-ink"
                >
                  Убрать
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {upsells.length > 0 ? (
        <section>
          <p className="eyebrow">Добор</p>
          <h2 className="mt-2 text-2xl font-medium md:text-3xl">Добавить к заказу</h2>
          <p className="mt-2 text-sm text-ink/55">
            Обычно берут вместе.
          </p>
          <div className="mt-6 grid grid-cols-2 items-stretch gap-3 md:grid-cols-3 md:gap-6">
            {upsells.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between md:p-6">
        <div className="min-w-0">
          <div className="font-display text-2xl tracking-[0.04em] md:text-3xl">
            К оплате {formatPrice(total + shipping)}
          </div>
          <div className="mt-1 text-sm text-ink/50">
            Товары {formatPrice(total)} · доставка{' '}
            {shipping === 0 ? 'бесплатно' : formatPrice(shipping)}
          </div>
          {saved > 0 ? (
            <div className="mt-1 text-sm text-lavender-deep">
              Скидка {formatPrice(saved)}
            </div>
          ) : null}
        </div>
        <Link href="/checkout" className="btn btn-primary min-h-12 w-full sm:w-auto">
          Оформить
        </Link>
      </div>
    </div>
  );
}
