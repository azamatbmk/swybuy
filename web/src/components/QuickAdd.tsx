'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { Product } from '@/lib/types';

export function QuickAdd({ product }: { product: Product }) {
  const { add, items } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.some((item) => item.sku === product.sku);

  if (product.stock <= 0) {
    return <span className="text-xs text-ink/40">Нет</span>;
  }

  return (
    <button
      type="button"
      className="btn btn-primary px-3 py-1.5 text-xs"
      onClick={() => {
        add(product);
        setAdded(true);
      }}
    >
      {added || inCart ? 'Ещё' : 'В корзину'}
    </button>
  );
}
