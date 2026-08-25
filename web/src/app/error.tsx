'use client';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      <h1 className="text-3xl font-medium">Не получилось открыть страницу</h1>
      <p className="mt-3 text-sm text-ink/60">
        Обновите или вернитесь на витрину.
      </p>
      <button onClick={reset} className="btn btn-primary mt-6">
        Ещё раз
      </button>
    </div>
  );
}
