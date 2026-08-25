import Link from 'next/link';

export default function PayFailPage() {
  return (
    <div className="card p-10 text-center md:p-14">
      <h1 className="text-4xl font-medium">Оплата не прошла</h1>
      <p className="mt-3 text-ink/60">
        Товары остались в корзине — можно оформить заказ ещё раз.
      </p>
      <Link href="/cart" className="btn btn-primary mt-6">
        В корзину
      </Link>
    </div>
  );
}
