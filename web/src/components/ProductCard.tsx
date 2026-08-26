import Link from 'next/link';
import { Product } from '@/lib/types';
import { ProductImage } from './ProductImage';
import { PriceTag } from './PriceTag';
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
    <article className="card flex h-full flex-col overflow-hidden">
      <Link href={href} className="group block">
        <div className="aspect-[4/5] overflow-hidden bg-cream">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className="px-3 pt-3 text-[13px] font-medium leading-snug tracking-[-0.02em] text-ink/80 md:px-4 md:pt-4 md:text-[15px]">
          <span className="line-clamp-2 min-h-[2.4em]">{product.name}</span>
        </div>
      </Link>
      <div className="mt-auto flex flex-col gap-2 p-3 pt-2 md:flex-row md:items-end md:justify-between md:gap-3 md:p-4 md:pt-2">
        <div>
          <PriceTag product={product} size="sm" />
          <div className="mt-1 text-xs text-ink/45">
            {product.stock > 0 ? 'На складе' : 'Нет в наличии'}
          </div>
        </div>
        <QuickAdd product={product} />
      </div>
    </article>
  );
}
