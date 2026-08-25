const items = [
  ['Склад', 'Товар уже у нас, не под заказ'],
  ['В день покупки', 'По Северной Осетии'],
  ['Бесплатно', 'Доставка по республике'],
  ['Наличные', 'При получении'],
];

export function TrustBar() {
  return (
    <ul className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-4">
      {items.map(([title, text]) => (
        <li key={title} className="card min-w-0 px-4 py-4 md:px-5 md:py-5">
          <div className="font-display text-[1.2rem] leading-tight tracking-[0.04em] md:text-[1.45rem]">
            {title}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink/55">{text}</p>
        </li>
      ))}
    </ul>
  );
}
