'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { saveOrderToken } from '@/lib/order-token';
import { OSSETIA_CITIES } from '@/lib/ossetia';
import { readRefFromDocument } from '@/lib/ref';
import { formatPrice } from '@/lib/types';
import { deliveryPrice } from '@/lib/shop';

export default function CheckoutPage() {
  const { items, total, clear, ready, syncFromCatalog } = useCart();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .products()
      .then(syncFromCatalog)
      .catch(() => undefined);
  }, [syncFromCatalog]);

  if (!ready) {
    return <p className="text-ink/50">Загружаем корзину…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="card max-w-md px-5 py-10 md:px-8 md:py-12">
        <h1 className="text-3xl font-medium">Корзина пуста</h1>
        <p className="mt-3 text-ink/60">Добавьте средство с витрины.</p>
        <Link href="/" className="btn btn-primary mt-6">
          К витрине
        </Link>
      </div>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(event.currentTarget);

    const phone = String(form.get('phone') || '').trim();
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Укажите телефон, например +7 928 123-45-67');
      setLoading(false);
      return;
    }

    try {
      const order = await api.createOrder({
        items: items.map((item) => ({ sku: item.sku, quantity: item.quantity })),
        ref: readRefFromDocument() || undefined,
        customerName: String(form.get('customerName')),
        phone,
        email: String(form.get('email') || '').trim() || undefined,
        city: String(form.get('city') || '').trim() || undefined,
        street: String(form.get('street') || '').trim() || undefined,
        house: String(form.get('house') || '').trim() || undefined,
        apartment: String(form.get('apartment') || '').trim() || undefined,
        deliveryType: 'pochta',
        paymentMethod: 'cash',
      });
      if (order.accessToken) {
        saveOrderToken(order.id, order.accessToken);
      }
      clear();
      router.push(`/order/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось оформить');
      setLoading(false);
    }
  }

  return (
    <div className="grid items-start gap-8 md:grid-cols-2">
      <form onSubmit={onSubmit} className="card space-y-3 p-5 md:p-8">
        <h1 className="text-3xl font-medium md:text-4xl">Оформление</h1>
        <p className="text-sm text-ink/55">
          Доставка по Северной Осетии в день покупки, бесплатно. Нужны имя и
          телефон, адрес можно дописать позже.
        </p>
        <label className="block text-sm">
          Имя *
          <input
            name="customerName"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            className="field mt-1"
          />
        </label>
        <label className="block text-sm">
          Телефон *
          <input
            name="phone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="+7 928 123-45-67"
            className="field mt-1"
          />
        </label>
        <label className="block text-sm">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            className="field mt-1"
          />
        </label>
        <label className="block text-sm">
          Населённый пункт, РСО-Алания
          <select name="city" defaultValue="" className="field mt-1">
            <option value="">Не указан</option>
            {OSSETIA_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Улица
          <input
            name="street"
            minLength={2}
            maxLength={120}
            autoComplete="address-line1"
            className="field mt-1"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            Дом
            <input
              name="house"
              maxLength={20}
              autoComplete="address-line2"
              className="field mt-1"
            />
          </label>
          <label className="block text-sm">
            Квартира
            <input name="apartment" maxLength={20} className="field mt-1" />
          </label>
        </div>

        <fieldset className="space-y-2 pt-2">
          <legend className="text-sm font-medium">Оплата</legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-cream/80 px-3 py-3 text-sm">
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              defaultChecked
              className="mt-1"
            />
            <span>
              <span className="font-medium">Наличными при получении</span>
              <span className="mt-1 block text-ink/55">
                Привезём, деньги — при вручении.
              </span>
            </span>
          </label>
          <div className="flex items-start gap-3 rounded-2xl bg-cream/50 px-3 py-3 text-sm text-ink/45">
            <input type="radio" disabled className="mt-1" />
            <span>
              <span className="font-medium text-ink/50">Картой онлайн</span>
              <span className="mt-1 block">Скоро</span>
            </span>
          </div>
        </fieldset>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button disabled={loading} className="btn btn-primary min-h-12 w-full">
          {loading ? 'Создаём заказ…' : 'Оформить заказ'}
        </button>
        <p className="text-center text-xs text-ink/50">
          По Северной Осетии — в день покупки, бесплатно.
        </p>
      </form>
      <div className="card p-5 md:p-8">
        <h2 className="text-2xl font-medium md:text-3xl">Сумма</h2>
        <div className="mt-4 space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.sku} className="flex justify-between gap-3">
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
            <span className="shrink-0">
              {deliveryPrice(total) === 0
                ? 'бесплатно'
                : formatPrice(deliveryPrice(total))}
            </span>
          </div>
          <div className="flex justify-between gap-3 border-t border-stone-100 pt-3 text-lg font-semibold">
            <span className="min-w-0">При получении</span>
            <span className="shrink-0 tabular-nums">
              {formatPrice(total + deliveryPrice(total))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
