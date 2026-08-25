'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { readOrderToken, saveOrderToken } from '@/lib/order-token';

export default function MockPayPage() {
  const params = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const leaked = searchParams.get('t') || '';
    if (leaked) {
      saveOrderToken(params.orderId, leaked);
      router.replace(`/pay/mock/${params.orderId}`);
      return;
    }
    setToken(readOrderToken(params.orderId));
  }, [params.orderId, router, searchParams]);

  return (
    <div className="card mx-auto max-w-md p-5 text-center md:p-10">
      <h1 className="text-3xl font-medium md:text-4xl">Тестовая оплата</h1>
      <p className="mt-3 text-sm text-ink/70">
        Это заглушка. В бою кнопка будет только у ЮKassa.
      </p>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-6 flex flex-col gap-3">
        <button
          disabled={loading || !token}
          className="btn btn-primary"
          onClick={async () => {
            if (!token) {
              setError('Нет доступа к заказу');
              return;
            }
            setLoading(true);
            try {
              await api.mockPay(params.orderId, token);
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
