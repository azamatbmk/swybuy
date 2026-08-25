'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';

export default function MockPayPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const { clear } = useCart();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="card mx-auto max-w-md p-8 text-center md:p-10">
      <h1 className="text-4xl font-medium">Тестовая оплата</h1>
      <p className="mt-3 text-sm text-ink/70">
        ЮKassa ещё не подключена. Это заглушка: нажми «Оплачено», заказ станет
        paid, остаток на складе спишется.
      </p>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-6 flex flex-col gap-3">
        <button
          disabled={loading}
          className="btn btn-primary"
          onClick={async () => {
            setLoading(true);
            try {
              await api.mockPay(params.orderId);
              clear();
              router.push(`/order/${params.orderId}`);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Ошибка оплаты');
              setLoading(false);
            }
          }}
        >
          Оплачено
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => router.push('/pay/fail')}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
