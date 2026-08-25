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
  { id: 'new', label: 'Собрать' },
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

function phoneHref(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) {
    return '';
  }
  let national = digits;
  if (digits.length === 11 && (digits.startsWith('8') || digits.startsWith('7'))) {
    national = digits.slice(1);
  } else if (digits.length === 10) {
    national = digits;
  } else {
    return `tel:+${digits}`;
  }
  return `tel:+7${national}`;
}

function filterCount(orders: Order[], id: (typeof FILTERS)[number]['id']) {
  if (id === 'all') {
    return orders.length;
  }
  if (id === 'new') {
    return orders.filter((order) =>
      ['confirmed', 'paid'].includes(order.status),
    ).length;
  }
  return orders.filter((order) => order.status === id).length;
}

export function OrdersBoard({
  orders,
  setOrders,
}: {
  orders: Order[];
  setOrders: (update: (current: Order[]) => Order[]) => void;
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('new');
  const [error, setError] = useState('');

  const visible = useMemo(
    () =>
      filter === 'all'
        ? orders
        : filter === 'new'
          ? orders.filter((order) =>
              ['confirmed', 'paid'].includes(order.status),
            )
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
        <h2 className="text-2xl font-medium">Заказы</h2>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`min-h-10 rounded-full px-3 py-1.5 text-sm ${
                filter === item.id
                  ? 'bg-lavender-full text-white'
                  : 'bg-white text-ink/70'
              }`}
            >
              {item.label} · {filterCount(orders, item.id)}
            </button>
          ))}
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-4 space-y-3">
        {visible.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-ink/60">Заказов нет</p>
        ) : null}
        {visible.map((order) => {
          const place = address(order);
          const call = phoneHref(order.phone);
          return (
            <article key={order.id} className="rounded-2xl bg-white p-4 text-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="font-medium">
                    {order.customerName} · {formatPrice(order.total)}
                  </div>
                  <div className="mt-1 text-ink/50">
                    {formatDate(order.createdAt)}
                    {` · ${paymentMethodLabel(order.paymentMethod)}`}
                    {order.ref ? ` · ${order.ref}` : ''}
                  </div>
                </div>
                <select
                  value={order.status}
                  onChange={(event) =>
                    patch(order.id, { status: event.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-stone-200 px-3 py-2 sm:w-auto"
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
                    <span className="min-w-0">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
                <li className="flex justify-between text-ink/50">
                  <span>Доставка · {deliveryTypeLabel(order.deliveryType)}</span>
                  <span>{formatPrice(order.deliveryPrice)}</span>
                </li>
              </ul>

              {call ? (
                <a
                  href={call}
                  className="mt-3 inline-block font-medium text-lavender-deep"
                >
                  {order.phone}
                </a>
              ) : (
                <p className="mt-3 text-ink/70">{order.phone}</p>
              )}
              {order.email ? (
                <p className="mt-1 text-ink/60">{order.email}</p>
              ) : null}

              {place ? (
                <p className="mt-1 text-ink/70">{place}</p>
              ) : (
                <p className="mt-1 text-amber-800">Адрес не указан — уточнить по телефону</p>
              )}

              <input
                defaultValue={order.trackNumber || ''}
                placeholder="Трек-номер Почты России"
                className="mt-3 min-h-11 w-full rounded-xl border border-stone-200 px-3 py-2"
                onBlur={(event) => {
                  const trackNumber = event.target.value.trim();
                  if (trackNumber === (order.trackNumber || '')) {
                    return;
                  }
                  patch(order.id, { trackNumber });
                }}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
