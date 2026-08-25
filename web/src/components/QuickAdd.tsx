'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { Product } from '@/lib/types';

export function QuickAdd({ product }: { product: Product }) {
  const { add, items } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.some((item) => item.sku === product.sku);

  if (product.stock <= 0) {
        return <span className="text-xs text-ink/40">Нет в наличии</span>;
  }

  return (
    <button
      type="button"
      className="btn btn-primary min-h-10 w-full px-3 py-2 text-xs md:w-auto md:min-h-0 md:py-1.5"
      onClick={() => {
        add(product);
        setAdded(true);
      }}
    >
      {added || inCart ? 'Ещё' : 'В корзину'}
    </button>
  );
}
