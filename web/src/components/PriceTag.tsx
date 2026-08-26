import { Product, formatPrice, sellingPrice } from '@/lib/types';

export function PriceTag({
  product,
  size = 'md',
}: {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
}) {
  const pay = sellingPrice(product);
  const off = (product.discountPercent || 0) > 0 && product.price > pay;
  const priceClass =
    size === 'lg'
      ? 'text-3xl md:text-4xl'
      : size === 'sm'
        ? 'text-lg md:text-xl'
        : 'text-xl md:text-2xl';
  const struck =
    size === 'sm'
      ? 'text-xs text-ink/40 line-through'
      : 'text-sm text-ink/40 line-through';

  if (!off) {
    return (
      <div className={`font-display tracking-[0.04em] ${priceClass}`}>
        {formatPrice(pay)}
      </div>
    );
  }

  return (
    <div>
      <div className={struck}>{formatPrice(product.price)}</div>
      <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className={`font-display tracking-[0.04em] ${priceClass}`}>
          {formatPrice(pay)}
        </span>
        <span
          className={
            size === 'sm'
              ? 'text-xs text-lavender-deep'
              : 'text-sm text-lavender-deep'
          }
        >
          −{product.discountPercent}%
        </span>
      </div>
    </div>
  );
}
