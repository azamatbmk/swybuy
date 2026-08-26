import Link from 'next/link';
import { Product, formatPrice, sellingPrice } from '@/lib/types';
import { ROUTINES, productsBySkus } from '@/lib/shop';

export function RoutineCards({
  products,
  refSlug,
}: {
  products: Product[];
  refSlug?: string;
}) {
  const routines = ROUTINES.map((routine) => {
    const items = productsBySkus(products, routine.skus);
    return { routine, items };
  }).filter(({ items }) => items.length > 0);

  if (routines.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {routines.map(({ routine, items }) => {
        const total = items.reduce((sum, item) => sum + sellingPrice(item), 0);
        const first = items[0];
        const href = first
          ? refSlug
            ? `/p/${first.slug}?ref=${refSlug}`
            : `/p/${first.slug}`
          : '/';

        return (
          <Link key={routine.id} href={href} className="card group min-w-0 p-5 md:p-6">
            <div className="font-display text-[1.7rem] tracking-[0.04em] transition group-hover:text-lavender-deep md:text-3xl">
              {routine.title}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink/55">{routine.text}</p>
            <p className="mt-6 text-sm text-ink/80">
              {items.length} средства · {formatPrice(total)}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
