'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Author, Order, Product, ShopSettings, formatPrice } from '@/lib/types';
import { AuthorsBoard } from './AuthorsBoard';
import { OrdersBoard } from './OrdersBoard';
import { ProductsBoard } from './ProductsBoard';

export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<'orders' | 'products' | 'authors'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<ShopSettings>({
    globalDiscountOn: false,
    globalDiscountPercent: 0,
  });
  const [authors, setAuthors] = useState<Author[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setError('');
    setLoading(true);
    try {
      await api.adminPing();
      const [nextOrders, nextProducts, nextAuthors, nextSettings] =
        await Promise.all([
          api.adminOrders(),
          api.adminProducts(),
          api.adminAuthors(),
          api.adminSettings(),
        ]);
      setOrders(nextOrders);
      setProducts(nextProducts);
      setAuthors(nextAuthors);
      setSettings(nextSettings);
      setAuthed(true);
    } catch {
      setAuthed(false);
      setOrders([]);
      setProducts([]);
      setAuthors([]);
      setSettings({ globalDiscountOn: false, globalDiscountPercent: 0 });
    } finally {
      setLoading(false);
      setReady(true);
    }
  }

  async function enter(nextKey: string) {
    setError('');
    setLoading(true);
    try {
      await api.adminLogin(nextKey);
      const [nextOrders, nextProducts, nextAuthors, nextSettings] =
        await Promise.all([
          api.adminOrders(),
          api.adminProducts(),
          api.adminAuthors(),
          api.adminSettings(),
        ]);
      setOrders(nextOrders);
      setProducts(nextProducts);
      setAuthors(nextAuthors);
      setSettings(nextSettings);
      setAuthed(true);
    } catch (err) {
      setAuthed(false);
      setError(err instanceof Error ? err.message : 'Нет доступа');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    enter(String(form.get('key') || '').trim());
  }

  async function logout() {
    await api.adminLogout().catch(() => undefined);
    setAuthed(false);
    setOrders([]);
    setProducts([]);
    setAuthors([]);
    setSettings({ globalDiscountOn: false, globalDiscountPercent: 0 });
  }

  if (!ready) {
    return <p className="text-ink/50">Открываем админку…</p>;
  }

  if (!authed) {
    return (
      <form
        onSubmit={onLogin}
        className="card mx-auto max-w-md space-y-4 p-5 md:p-8"
      >
        <h1 className="text-4xl font-medium">Админка</h1>
        <input
          name="key"
          type="password"
          required
          autoFocus
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
          <h1 className="text-3xl font-medium">Админка</h1>
          <p className="mt-1 text-sm text-ink/60">
            {orders.length} заказов · {authors.length} витрин ·{' '}
            {products.filter((item) => item.active).length} в витрине · склад{' '}
            {formatPrice(
              products.reduce(
                (sum, item) => sum + (item.salePrice ?? item.price) * item.stock,
                0,
              ),
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => load()}
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

      <div className="flex flex-wrap gap-2">
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
        <button
          onClick={() => setTab('authors')}
          className={`rounded-full px-4 py-2 text-sm ${
            tab === 'authors' ? 'bg-lavender-full text-white' : 'bg-white'
          }`}
        >
          Блогеры
        </button>
      </div>

      {tab === 'orders' ? (
        <OrdersBoard orders={orders} setOrders={setOrders} />
      ) : tab === 'products' ? (
        <ProductsBoard
          products={products}
          settings={settings}
          setProducts={setProducts}
          setSettings={setSettings}
        />
      ) : (
        <AuthorsBoard
          authors={authors}
          products={products}
          setAuthors={setAuthors}
        />
      )}
    </div>
  );
}
