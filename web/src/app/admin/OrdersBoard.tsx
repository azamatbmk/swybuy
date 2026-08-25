'use client';

import { useMemo, useState } from 'react';
import { api } from '@/lib/api';
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUSES,
  Order,
  formatDate,
  formatPrice,
  paymentMethodLabel,
  deliveryTypeLabel,
} from '@/lib/types';

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'pending', label: 'Оплата' },
  { id: 'paid', label: 'Собрать' },
  { id: 'packed', label: 'Отправить' },
  { id: 'shipped', label: 'В пути' },
] as const;

function address(order: Order) {
  return [
    order.city,
    [order.street, order.house].filter(Boolean).join(' '),
    order.apartment ? `кв. ${order.apartment}` : '',
  ]
    .filter(Boolean)
    .join(', ');
}

function contacts(order: Order) {
  return [order.phone, order.email].filter(Boolean).join(' · ');
}

export function OrdersBoard({
  orders,
  setOrders,
}: {
  orders: Order[];
  setOrders: (update: (current: Order[]) => Order[]) => void;
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [error, setError] = useState('');

  const visible = useMemo(
    () =>
      filter === 'all'
        ? orders
        : filter === 'paid'
          ? orders.filter((order) => ['paid', 'confirmed'].includes(order.status))
          : orders.filter((order) => order.status === filter),
    [filter, orders],
  );

  async function patch(id: string, body: { status?: string; trackNumber?: string }) {
    setError('');
    try {
      const updated = await api.updateOrder(id, body);
      setOrders((current) =>
        current.map((row) => (row.id === id ? updated : row)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить заказ');
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Заказы</h2>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-3 py-1 text-sm ${
                filter === item.id
                  ? 'bg-lavender-full text-white'
                  : 'bg-white text-ink/70'
              }`}
            >
              {item.label}
              {item.id === 'all'
                ? ` · ${orders.length}`
                : item.id === 'paid'
                  ? ` · ${orders.filter((order) =>
                      ['paid', 'confirmed'].includes(order.status),
                    ).length}`
                  : ` · ${orders.filter((order) => order.status === item.id).length}`}
            </button>
          ))}
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-4 space-y-3">
        {visible.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-ink/60">Заказов нет</p>
        ) : null}
        {visible.map((order) => (
          <article key={order.id} className="rounded-2xl bg-white p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-medium">
                  {order.customerName} · {formatPrice(order.total)}
                </div>
                <div className="mt-1 text-ink/50">
                  {formatDate(order.createdAt)}
                  {` · ${paymentMethodLabel(order.paymentMethod)}`}
                  {order.ref ? ` · автор ${order.ref}` : ' · без автора'}
                  {order.authorAmount > 0
                    ? ` · ${formatPrice(order.authorAmount)} автору`
                    : ''}
                </div>
              </div>
              <select
                value={order.status}
                onChange={(event) => patch(order.id, { status: event.target.value })}
                className="rounded-lg border border-stone-200 px-2 py-1"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {ORDER_STATUS_LABEL[status]}
                  </option>
                ))}
              </select>
            </div>

            <ul className="mt-3 space-y-1 text-ink/80">
              {order.items.map((item) => (
                <li key={item.sku} className="flex justify-between gap-4">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
              <li className="flex justify-between text-ink/50">
                <span>Доставка · {deliveryTypeLabel(order.deliveryType)}</span>
                <span>{formatPrice(order.deliveryPrice)}</span>
              </li>
            </ul>

            {contacts(order) ? (
              <p className="mt-3 text-ink/70">{contacts(order)}</p>
            ) : null}
            {address(order) ? (
              <p className="mt-1 text-ink/70">{address(order)}</p>
            ) : (
              <p className="mt-1 text-ink/40">Адрес не указан</p>
            )}

            <input
              defaultValue={order.trackNumber || ''}
              placeholder="Трек-номер Почты России"
              className="mt-3 w-full rounded-lg border border-stone-200 px-3 py-2"
              onBlur={(event) => {
                const trackNumber = event.target.value.trim();
                if (trackNumber === (order.trackNumber || '')) {
                  return;
                }
                patch(order.id, { trackNumber });
              }}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
