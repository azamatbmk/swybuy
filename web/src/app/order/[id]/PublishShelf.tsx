'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { readShelfToken, saveShelfToken } from '@/lib/shelf-token';
import { Order } from '@/lib/types';

const PAID = new Set(['paid', 'packed', 'shipped']);

export function PublishShelf({ order }: { order: Order }) {
  const [name, setName] = useState(order.shelf?.name || order.customerName);
  const [selected, setSelected] = useState<string[]>(() =>
    order.shelf ? order.items.map((item) => item.sku) : [],
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(order.shelf);

  useEffect(() => {
    if (!order.shelf) {
      return;
    }
    api
      .shelf(order.shelf.slug)
      .then((shelf) => setSelected(shelf.products.map((item) => item.sku)))
      .catch(() => undefined);
  }, [order.shelf]);

  const uniqueItems = useMemo(() => {
    const seen = new Set<string>();
    return order.items.filter((item) => {
      if (seen.has(item.sku)) {
        return false;
      }
      seen.add(item.sku);
      return true;
    });
  }, [order.items]);

  if (!PAID.has(order.status)) {
    return null;
  }

  function toggle(sku: string) {
    setSelected((current) =>
      current.includes(sku)
        ? current.filter((item) => item !== sku)
        : [...current, sku],
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const shelf = await api.publishShelf(order.id, {
        name,
        skus: selected,
        token: published ? readShelfToken(published.slug) || undefined : undefined,
      });
      saveShelfToken(shelf.slug, shelf.token);
      setPublished({ slug: shelf.slug, name: shelf.name });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось собрать полку');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 border-t border-ink/10 pt-6">
      <p className="eyebrow">Полка</p>
      <h2 className="mt-2 text-2xl font-medium">Показать, что берёте</h2>
      <p className="mt-2 text-sm text-ink/55">
        На публичной странице будут только отмеченные средства. Цена заказа,
        адрес и трек туда не попадут.
      </p>

      <label className="mt-4 block text-sm">
        Как вас называть
        <input
          required
          minLength={2}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="field mt-1"
        />
      </label>

      <div className="mt-4 space-y-2">
        {uniqueItems.map((item) => (
          <label
            key={item.sku}
            className="flex items-start gap-3 rounded-2xl bg-cream/80 px-3 py-2 text-sm"
          >
            <input
              type="checkbox"
              className="mt-1"
              checked={selected.includes(item.sku)}
              onChange={() => toggle(item.sku)}
            />
            <span>{item.name}</span>
          </label>
        ))}
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <button disabled={saving || selected.length === 0} className="btn btn-primary mt-5">
        {saving
          ? 'Сохраняем…'
          : published
            ? 'Обновить полку'
            : 'Собрать полку'}
      </button>

      {published ? (
        <p className="mt-4 text-sm text-ink/70">
          Полка:{' '}
          <Link href={`/u/${published.slug}`} className="text-lavender-full">
            /u/{published.slug}
          </Link>
          . Ссылку можно отправить подруге.
        </p>
      ) : null}
    </form>
  );
}
