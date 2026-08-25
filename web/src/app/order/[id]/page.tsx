import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/types';
import { PublishShelf } from './PublishShelf';

const statusLabel: Record<string, string> = {
  pending: 'Ожидает оплату',
  paid: 'Оплачен',
  packed: 'Собран',
  shipped: 'Отправлен',
  returned: 'Возврат',
  failed: 'Ошибка',
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await api.order(id);

  return (
    <div className="card mx-auto max-w-xl p-8 md:p-10">
      <h1 className="text-4xl font-medium">Заказ принят</h1>
      <p className="mt-2 text-ink/70">
        Статус: {statusLabel[order.status] || order.status}
      </p>
      <div className="mt-6 space-y-2 text-sm">
        {order.items.map((item) => (
          <div key={item.sku} className="flex justify-between">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between text-ink/60">
          <span>Доставка</span>
          <span>{formatPrice(order.deliveryPrice)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Итого</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
      {order.ref ? (
        <p className="mt-4 text-sm text-ink/60">Заказ записан на автора {order.ref}</p>
      ) : null}
      {order.trackNumber ? (
        <p className="mt-2 text-sm">Трек: {order.trackNumber}</p>
      ) : (
        <p className="mt-4 text-sm text-ink/60">
          Трек появится после отправки. Обычно 1–2 дня.
        </p>
      )}
      <Link href="/" className="mt-6 inline-block text-lavender-full">
        На витрину
      </Link>
      <PublishShelf order={order} />
    </div>
  );
}
