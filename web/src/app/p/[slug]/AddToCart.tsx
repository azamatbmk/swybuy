'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { Product } from '@/lib/types';

export function AddToCart({ product }: { product: Product }) {
  const { add, items } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const inCart = items.some((item) => item.sku === product.sku);

  if (product.stock <= 0) {
    return (
      <button
        disabled
        className="btn mt-6 w-full bg-stone-200 text-stone-500"
      >
        Нет в наличии
      </button>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={1}
          max={product.stock}
          value={quantity}
          onChange={(event) =>
            setQuantity(
              Math.min(product.stock, Math.max(1, Number(event.target.value))),
            )
          }
          className="field w-20"
        />
        <button
          className="btn btn-primary flex-1"
          onClick={() => add(product, quantity)}
        >
          {inCart ? 'Добавить ещё' : 'В корзину'}
        </button>
      </div>
      <button
        className="btn btn-ghost w-full"
        onClick={() => {
          add(product, quantity);
          router.push('/checkout');
        }}
      >
        Купить сейчас
      </button>
      {inCart ? (
        <Link href="/cart" className="block text-center text-sm text-lavender-full">
          Перейти в корзину
        </Link>
      ) : null}
    </div>
  );
}
