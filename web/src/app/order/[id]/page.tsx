'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { isSafePaymentUrl } from '@/lib/payment-url';
import { readOrderToken, saveOrderToken } from '@/lib/order-token';
import { formatPrice, paymentMethodLabel, Order } from '@/lib/types';
import { PublishShelf } from './PublishShelf';

const statusLabel: Record<string, string> = {
  pending: 'Ожидает оплату',
  confirmed: 'Принят, оплата при получении',
  paid: 'Оплачен',
  packed: 'Собран',
  shipped: 'Отправлен',
  returned: 'Возврат',
  failed: 'Не оплачен или отменён',
};

export default function OrderPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const leaked = searchParams.get('t') || '';
    if (leaked) {
      saveOrderToken(id, leaked);
      router.replace(`/order/${id}`);
      return;
    }
    const token = readOrderToken(id);
    if (!token) {
      setError(
        'Заказ открывается с того же устройства, где его оформили. Ссылку с токеном больше не шлём.',
      );
      return;
    }
    api
      .order(id, token)
      .then(setOrder)
      .catch(() => setError('Заказ не найден'));
  }, [id, router, searchParams]);

  if (error && !order) {
    return (
      <div className="card mx-auto max-w-xl p-5 md:p-8">
        <h1 className="text-3xl font-medium">Заказ недоступен</h1>
        <p className="mt-3 text-ink/60">{error}</p>
        <Link href="/" className="mt-6 inline-block text-lavender-full">
          На витрину
        </Link>
      </div>
    );
  }

  if (!order) {
    return <p className="text-ink/50">Загружаем заказ…</p>;
  }

  const token = readOrderToken(id) || order.accessToken || '';
  const unpaid = order.status === 'pending';
  const orderId = order.id;

  async function payAgain() {
    if (!token) {
      return;
    }
    setPaying(true);
    try {
      const { paymentUrl } = await api.payAgain(orderId, token);
      if (!isSafePaymentUrl(paymentUrl)) {
        throw new Error('Некорректная ссылка на оплату');
      }
      window.location.href = paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось открыть оплату');
      setPaying(false);
    }
  }

  return (
    <div className="card mx-auto max-w-xl p-5 md:p-10">
      <h1 className="text-[1.85rem] font-medium leading-tight md:text-4xl">
        {unpaid ? 'Заказ создан, нужна оплата' : 'Заказ принят'}
      </h1>
      <p className="mt-2 text-ink/70">
        Статус: {statusLabel[order.status] || order.status}
      </p>
      <div className="mt-6 space-y-2 text-sm">
        {order.items.map((item) => (
          <div key={`${item.sku}-${item.quantity}`} className="flex justify-between gap-3">
            <span className="min-w-0">
              {item.name} × {item.quantity}
            </span>
            <span className="shrink-0 tabular-nums">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
        <div className="flex justify-between gap-3 text-ink/60">
          <span className="min-w-0">Доставка по Северной Осетии</span>
          <span>
            {order.deliveryPrice === 0
              ? 'бесплатно'
              : formatPrice(order.deliveryPrice)}
          </span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Итого</span>
          <span>{formatPrice(order.total)}</span>
        </div>
        <p className="pt-2 text-ink/60">
          {order.paymentMethod === 'cash'
            ? `Оплата наличными при получении · ${formatPrice(order.total)}`
            : paymentMethodLabel(order.paymentMethod)}
        </p>
      </div>
      {unpaid ? (
        <button
          disabled={paying}
          onClick={payAgain}
          className="btn btn-primary mt-6 w-full"
        >
          {paying ? 'Открываем оплату…' : 'Оплатить'}
        </button>
      ) : null}
      {order.trackNumber ? (
        <p className="mt-4 text-sm">Трек Почты России: {order.trackNumber}</p>
      ) : (
        <p className="mt-4 text-sm text-ink/60">
          По Северной Осетии обычно привозим в день покупки. Если уйдёт через
          отделение — трек появится здесь.
        </p>
      )}
      <Link href="/" className="mt-6 inline-block text-lavender-full">
        На витрину
      </Link>
      {token ? <PublishShelf order={order} orderToken={token} /> : null}
    </div>
  );
}
