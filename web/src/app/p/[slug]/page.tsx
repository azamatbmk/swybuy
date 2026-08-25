import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { ProductImage } from '@/components/ProductImage';
import { api } from '@/lib/api';
import { FREE_DELIVERY_FROM, relatedProducts } from '@/lib/shop';
import { formatPrice } from '@/lib/types';
import { AddToCart } from './AddToCart';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const [product, catalog] = await Promise.all([
      api.product(slug),
      api.products(),
    ]);
    const related = relatedProducts(product, catalog);

    return (
      <div className="space-y-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div className="card overflow-hidden">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              className="aspect-[4/5] h-full w-full object-cover"
            />
          </div>
          <div className="md:pt-4">
            <p className="eyebrow">На складе</p>
            <h1 className="mt-3 text-4xl font-medium md:text-5xl">
              {product.name}
            </h1>
            <div className="mt-4 font-display text-4xl tracking-[0.04em]">
              {formatPrice(product.price)}
            </div>
            <p className="mt-6 leading-relaxed text-ink/75">{product.description}</p>
            {product.warning ? (
              <p className="mt-5 rounded-2xl bg-lavender/40 px-4 py-3 text-sm leading-relaxed text-ink/75">
                {product.warning}
              </p>
            ) : null}
            <p className="mt-5 text-sm text-ink/60">
              <span className="font-medium text-ink">Кому подойдёт.</span>{' '}
              {product.forWhom}
            </p>
            {product.ingredients ? (
              <div className="mt-6">
                <p className="text-sm font-medium text-ink">Состав</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/55">
                  {product.ingredients}
                </p>
              </div>
            ) : null}
            <p className="mt-4 text-sm text-ink/70">
              {product.stock > 0
                ? `Отправим за 1–2 дня · ${product.stock} шт`
                : 'Нет в наличии'}
            </p>
            <p className="mt-2 text-sm text-ink/45">
              СДЭК 350 ₽, бесплатно от {formatPrice(FREE_DELIVERY_FROM)}
            </p>
            <AddToCart product={product} />
          </div>
        </div>

        {related.length > 0 ? (
          <section>
            <p className="eyebrow">К этому заказу</p>
            <h2 className="mt-3 text-4xl font-medium">Часто берут вместе</h2>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    );
  } catch {
    notFound();
  }
}
