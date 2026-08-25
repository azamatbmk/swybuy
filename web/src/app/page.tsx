import { Suspense } from 'react';
import { Catalog } from '@/components/Catalog';
import { RoutineCards } from '@/components/RoutineCards';
import { TrustBar } from '@/components/TrustBar';
import { api } from '@/lib/api';

export default async function HomePage() {
  const products = await api.products();
  const hero = products.filter((product) => product.imageUrl.endsWith('.jpg')).slice(0, 3);

  return (
    <div className="space-y-10 md:space-y-16">
      <section className="grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr] md:gap-10">
        <div>
          <p className="eyebrow">Склад, не маркетплейс</p>
          <h1 className="mt-3 max-w-xl text-[2.15rem] font-medium leading-[1.12] text-balance md:mt-4 md:text-7xl">
            Нашли в каталоге — можно заказать
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink/65 md:mt-5 md:text-base">
            {products.length} средств на своём складе. Ищите по названию, составу
            или типу кожи и оформляйте. По Северной Осетии доставка в день
            покупки бесплатно.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href="#catalog" className="btn btn-primary min-h-12 w-full sm:w-auto">
              В каталог
            </a>
            <a href="#routines" className="btn btn-ghost min-h-12 w-full sm:w-auto">
              Собрать уход
            </a>
          </div>
        </div>
        {hero[0] ? (
          <div>
            <div className="flex h-52 items-center justify-center overflow-hidden rounded-[1.75rem] bg-white md:hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hero[0].imageUrl}
                alt=""
                className="max-h-full w-auto max-w-full object-contain p-4"
              />
            </div>
            <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[2rem] bg-lavender/50 md:block">
              {[hero[0], hero[1], hero[2]].map((product, index) =>
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
          </div>
        ) : null}
      </section>

      <TrustBar />

      <section id="catalog">
        <p className="eyebrow">На складе</p>
        <h2 className="mt-3 text-[2rem] font-medium md:text-5xl">Каталог</h2>
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
        <h2 className="mt-3 text-[2rem] font-medium md:text-5xl">Собрать уход</h2>
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
