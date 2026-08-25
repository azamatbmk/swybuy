import { formatPrice } from '@/lib/types';
import { FREE_DELIVERY_FROM } from '@/lib/shop';

const items = [
  ['Склад', 'Товар уже у нас, не под заказ'],
  ['1–2 дня', 'Соберём и отдадим в СДЭК'],
  ['Россия', 'Доставка по стране, 350 ₽'],
  ['От 2 500 ₽', `Доставка бесплатно от ${formatPrice(FREE_DELIVERY_FROM)}`],
];

export function TrustBar() {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map(([title, text]) => (
        <li key={title} className="card px-5 py-5">
          <div className="font-display text-[1.45rem] tracking-[0.04em] leading-tight">
            {title}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink/55">{text}</p>
        </li>
      ))}
    </ul>
  );
}
