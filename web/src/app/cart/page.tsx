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
  const { items, setQuantity, remove, total } = useCart();
  const [catalog, setCatalog] = useState<Product[]>([]);

  useEffect(() => {
    api.products().then(setCatalog).catch(() => setCatalog([]));
  }, []);

  const shipping = deliveryPrice(total);
  const upsells = cartUpsells(
    items.map((item) => item.sku),
    catalog,
  );

  if (items.length === 0) {
    return (
      <div className="space-y-10">
        <div className="card px-8 py-16 text-center">
          <h1 className="text-4xl font-medium">Корзина пуста</h1>
          <p className="mt-3 text-ink/55">Соберите утро или добавьте одно средство.</p>
          <Link href="/" className="btn btn-primary mt-6">
            К витрине
          </Link>
        </div>
        {catalog.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
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
        <h1 className="mt-2 text-5xl font-medium">Корзина</h1>
      </div>
      <DeliveryHint total={total} />
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.sku} className="card flex items-center gap-4 p-4">
            <ProductImage
              src={item.imageUrl}
              alt={item.name}
              className="h-20 w-20 rounded-2xl object-cover"
            />
            <div className="flex-1">
              <Link href={`/p/${item.slug}`} className="font-medium">
                {item.name}
              </Link>
              <div className="text-sm text-ink/50">{formatPrice(item.price)}</div>
            </div>
            <input
              type="number"
              min={1}
              max={item.stock}
              value={item.quantity}
              onChange={(event) =>
                setQuantity(item.sku, Number(event.target.value))
              }
              className="field w-16"
            />
            <button
              onClick={() => remove(item.sku)}
              className="text-sm text-ink/40 hover:text-ink"
            >
              Убрать
            </button>
          </div>
        ))}
      </div>

      {upsells.length > 0 ? (
        <section>
          <p className="eyebrow">Добор</p>
          <h2 className="mt-2 text-3xl font-medium">Добавить к заказу</h2>
          <p className="mt-2 text-sm text-ink/55">
            Обычно берут вместе — и так проще добрать бесплатную доставку.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {upsells.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <div className="font-display text-3xl tracking-[0.04em]">
            К оплате {formatPrice(total + shipping)}
          </div>
          <div className="mt-1 text-sm text-ink/50">
            Товары {formatPrice(total)} · доставка{' '}
            {shipping === 0 ? 'бесплатно' : formatPrice(shipping)}
          </div>
        </div>
        <Link href="/checkout" className="btn btn-primary">
          Оформить
        </Link>
      </div>
    </div>
  );
}
