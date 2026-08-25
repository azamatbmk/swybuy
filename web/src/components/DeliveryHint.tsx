'use client';

import { formatPrice } from '@/lib/types';
import { FREE_DELIVERY_FROM, deliveryPrice, toFreeDelivery } from '@/lib/shop';

export function DeliveryHint({ total }: { total: number }) {
  const shipping = deliveryPrice(total);
  const left = toFreeDelivery(total);
  const progress = Math.min(100, Math.round((total / FREE_DELIVERY_FROM) * 100));

  return (
    <div className="rounded-3xl bg-lavender/50 px-5 py-4 text-sm">
      <div className="h-1.5 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-lavender-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3">
        {shipping === 0 ? (
          <span>Доставка бесплатно</span>
        ) : (
          <span>
            Ещё {formatPrice(left)} до бесплатной доставки. Сейчас СДЭК —{' '}
            {formatPrice(shipping)}.
          </span>
        )}
      </p>
    </div>
  );
}
