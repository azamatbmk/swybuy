import Link from 'next/link';
import { Product, formatPrice } from '@/lib/types';
import { ProductImage } from './ProductImage';
import { QuickAdd } from './QuickAdd';

export function ProductCard({
  product,
  refSlug,
}: {
  product: Product;
  refSlug?: string;
}) {
  const href = refSlug ? `/p/${product.slug}?ref=${refSlug}` : `/p/${product.slug}`;

  return (
    <article className="card overflow-hidden">
      <Link href={href} className="group block">
        <div className="aspect-[4/5] overflow-hidden bg-cream">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className="px-4 pt-4 text-[15px] font-medium leading-snug tracking-[-0.02em] text-ink/80">
          {product.name}
        </div>
      </Link>
      <div className="flex items-end justify-between gap-3 p-4 pt-2">
        <div>
          <div className="font-display text-2xl tracking-[0.04em]">
            {formatPrice(product.price)}
          </div>
          <div className="mt-1 text-xs text-ink/45">
            {product.stock > 0 ? 'На складе' : 'Нет в наличии'}
          </div>
        </div>
        <QuickAdd product={product} />
      </div>
    </article>
  );
}
