'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { readRefFromDocument } from '@/lib/ref';
import { formatPrice } from '@/lib/types';
import { deliveryPrice } from '@/lib/shop';

export default function CheckoutPage() {
  const { items, total } = useCart();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <p className="text-ink/60">
        Корзина пуста. Вернитесь на витрину.
      </p>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      const order = await api.createOrder({
        items: items.map((item) => ({ sku: item.sku, quantity: item.quantity })),
        ref: readRefFromDocument(),
        customerName: String(form.get('customerName')),
        phone: String(form.get('phone')),
        email: String(form.get('email')),
        city: String(form.get('city')),
        street: String(form.get('street')),
        house: String(form.get('house')),
        apartment: String(form.get('apartment') || ''),
        deliveryType: 'cdek',
      });
      const mockId = order.paymentUrl?.match(/\/pay\/mock\/([^/?#]+)/)?.[1];
      if (mockId) {
        router.push(`/pay/mock/${mockId}`);
        return;
      }
      if (order.paymentUrl) {
        window.location.href = order.paymentUrl;
        return;
      }
      router.push(`/order/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось оформить');
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form onSubmit={onSubmit} className="card space-y-3 p-6 md:p-8">
        <h1 className="text-4xl font-medium">Оформление</h1>
        <p className="text-sm text-ink/55">
          Достаточно имени. Телефон поможет, если нужно уточнить заказ.
        </p>
        <input
          name="customerName"
          required
          minLength={2}
          placeholder="Имя *"
          className="field"
        />
        <input name="phone" placeholder="Телефон" className="field" />
        <input name="email" type="email" placeholder="Email" className="field" />
        <input name="city" placeholder="Город" className="field" />
        <input name="street" placeholder="Улица" className="field" />
        <div className="grid grid-cols-2 gap-3">
          <input name="house" placeholder="Дом" className="field" />
          <input name="apartment" placeholder="Кв." className="field" />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button disabled={loading} className="btn btn-primary w-full">
          {loading ? 'Создаём заказ…' : 'Оплатить'}
        </button>
        <p className="text-center text-xs text-ink/50">
          Склад отправит заказ за 1–2 дня после оплаты
        </p>
      </form>
      <div className="card p-6 md:p-8">
        <h2 className="text-3xl font-medium">Сумма</h2>
        <div className="mt-4 space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.sku} className="flex justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between text-ink/60">
            <span>Доставка СДЭК</span>
            <span>
              {deliveryPrice(total) === 0
                ? 'бесплатно'
                : formatPrice(deliveryPrice(total))}
            </span>
          </div>
          <div className="flex justify-between border-t border-stone-100 pt-3 text-lg font-semibold">
            <span>К оплате</span>
            <span>{formatPrice(total + deliveryPrice(total))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
