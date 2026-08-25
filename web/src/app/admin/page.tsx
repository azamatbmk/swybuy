'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { clearAdminKey, readAdminKey, writeAdminKey } from '@/lib/admin-session';
import { Order, Product } from '@/lib/types';
import { OrdersBoard } from './OrdersBoard';
import { ProductsBoard } from './ProductsBoard';

export default function AdminPage() {
  const [key, setKey] = useState('');
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function enter(nextKey: string) {
    setError('');
    setLoading(true);
    try {
      await api.adminPing(nextKey);
      const [nextOrders, nextProducts] = await Promise.all([
        api.adminOrders(nextKey),
        api.adminProducts(nextKey),
      ]);
      writeAdminKey(nextKey);
      setKey(nextKey);
      setOrders(nextOrders);
      setProducts(nextProducts);
      setAuthed(true);
    } catch (err) {
      clearAdminKey();
      setAuthed(false);
      setError(err instanceof Error ? err.message : 'Нет доступа');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const stored = readAdminKey();
    setKey(stored);
    setReady(true);
    if (stored) {
      enter(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    enter(String(form.get('key') || '').trim());
  }

  function logout() {
    clearAdminKey();
    setAuthed(false);
    setKey('');
    setOrders([]);
    setProducts([]);
  }

  if (!ready) {
    return null;
  }

  if (!authed) {
    return (
      <form
        onSubmit={onLogin}
        className="card mx-auto max-w-md space-y-4 p-8"
      >
        <h1 className="text-4xl font-semibold">Админка</h1>
        <p className="text-sm text-ink/60">
          Ключ из <code>api/.env</code>, поле <code>ADMIN_KEY</code>.
        </p>
        <input
          name="key"
          type="password"
          required
          autoFocus
          defaultValue={key}
          placeholder="Ключ админа"
          className="field"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? 'Входим…' : 'Войти'}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Админка</h1>
          <p className="mt-1 text-sm text-ink/60">
            {orders.length} заказов · {products.filter((item) => item.active).length}{' '}
            на витрине
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => enter(key)}
            className="rounded-full border border-stone-200 px-4 py-2 text-sm"
          >
            Обновить
          </button>
          <button
            onClick={logout}
            className="rounded-full bg-lavender-full px-4 py-2 text-sm text-white"
          >
            Выйти
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('orders')}
          className={`rounded-full px-4 py-2 text-sm ${
            tab === 'orders' ? 'bg-lavender-full text-white' : 'bg-white'
          }`}
        >
          Заказы
        </button>
        <button
          onClick={() => setTab('products')}
          className={`rounded-full px-4 py-2 text-sm ${
            tab === 'products' ? 'bg-lavender-full text-white' : 'bg-white'
          }`}
        >
          Товары
        </button>
      </div>

      {tab === 'orders' ? (
        <OrdersBoard adminKey={key} orders={orders} setOrders={setOrders} />
      ) : (
        <ProductsBoard
          adminKey={key}
          products={products}
          setProducts={setProducts}
        />
      )}
    </div>
  );
}
