import Link from 'next/link';

export default function PayFailPage() {
  return (
    <div className="card p-5 text-center md:p-14">
      <h1 className="text-3xl font-medium md:text-4xl">Оплата не прошла</h1>
      <p className="mt-3 text-ink/60">
        Заказ уже создан. Вернитесь по ссылке после оформления и нажмите
        «Оплатить», либо соберите корзину заново.
      </p>
      <Link href="/" className="btn btn-primary mt-6">
        На витрину
      </Link>
    </div>
  );
}
