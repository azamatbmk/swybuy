import { Suspense } from 'react';
import { Catalog } from '@/components/Catalog';
import { RoutineCards } from '@/components/RoutineCards';
import { TrustBar } from '@/components/TrustBar';
import { api } from '@/lib/api';

export default async function HomePage() {
  const products = await api.products();
  const hero = products.filter((product) => product.imageUrl.endsWith('.jpg')).slice(0, 3);

  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="eyebrow">Склад, не маркетплейс</p>
          <h1 className="mt-4 max-w-xl text-5xl font-medium md:text-7xl">
            Нашли в каталоге — можно заказать
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink/65">
            {products.length} средств на своём складе. Ищите по названию, составу
            или типу кожи и оформляйте. Отправка за 1–2 дня.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#catalog" className="btn btn-primary">
              В каталог
            </a>
            <a href="#routines" className="btn btn-ghost">
              Собрать уход
            </a>
          </div>
        </div>
        <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[2rem] bg-lavender/50 md:block">
          {(hero[0] ? [hero[0], hero[1], hero[2]] : []).map((product, index) =>
            product ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={product.sku}
                src={product.imageUrl}
                alt=""
                className={
                  index === 0
                    ? 'absolute left-[-8%] top-[8%] w-[70%] rotate-[-8deg] rounded-3xl shadow-card'
                    : index === 1
                      ? 'absolute right-[-6%] top-[22%] w-[62%] rotate-[7deg] rounded-3xl shadow-card'
                      : 'absolute bottom-[-4%] left-[18%] w-[54%] rotate-[-2deg] rounded-3xl shadow-card'
                }
              />
            ) : null,
          )}
        </div>
      </section>

      <TrustBar />

      <section id="catalog">
        <p className="eyebrow">На складе</p>
        <h2 className="mt-3 text-4xl font-medium md:text-5xl">Каталог</h2>
        <p className="mt-3 max-w-lg text-ink/60">
          Как раньше: нашли средство — положили в корзину.
        </p>
        <div className="mt-8">
          <Suspense>
            <Catalog products={products} />
          </Suspense>
        </div>
      </section>

      <section id="routines">
        <p className="eyebrow">Если не знаете, с чего начать</p>
        <h2 className="mt-3 text-4xl font-medium md:text-5xl">Собрать уход</h2>
        <p className="mt-3 max-w-lg text-ink/60">
          Готовые связки. Можно взять одно средство или весь набор.
        </p>
        <div className="mt-8">
          <RoutineCards products={products} />
        </div>
      </section>
    </div>
  );
}
