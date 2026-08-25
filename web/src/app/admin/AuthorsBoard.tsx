'use client';

import { FormEvent, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Author, Product } from '@/lib/types';

export function AuthorsBoard({
  authors,
  products,
  setAuthors,
}: {
  authors: Author[];
  products: Product[];
  setAuthors: (update: (current: Author[]) => Author[]) => void;
}) {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState<Author | 'new' | null>(null);
  const [handle, setHandle] = useState('');
  const [skus, setSkus] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState('');

  const visibleProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return products;
    }
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(needle) ||
        product.sku.toLowerCase().includes(needle),
    );
  }, [products, query]);

  function open(author: Author | 'new') {
    setError('');
    setQuery('');
    setEditor(author);
    if (author === 'new') {
      setHandle('');
      setSkus([]);
      return;
    }
    setHandle(author.handle || author.slug);
    setSkus(author.skus || []);
  }

  function toggle(sku: string) {
    setSkus((current) =>
      current.includes(sku)
        ? current.filter((item) => item !== sku)
        : [...current, sku],
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editor === 'new') {
        const created = await api.createAuthor({ handle, skus });
        setAuthors((current) =>
          [...current, created].sort((a, b) =>
            a.name.localeCompare(b.name, 'ru'),
          ),
        );
      } else if (editor?.id) {
        const updated = await api.updateAuthor(editor.id, { handle, skus });
        setAuthors((current) =>
          current.map((row) => (row.id === editor.id ? updated : row)),
        );
      }
      setEditor(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  }

  async function copyLink(slug: string) {
    const url = `${window.location.origin}/a/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(slug);
      window.setTimeout(() => setCopied(''), 1500);
    } catch {
      window.prompt('Скопируйте ссылку', url);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-medium">Блогеры</h2>
        <button
          onClick={() => open('new')}
          className="rounded-full bg-lavender-full px-4 py-2 text-sm text-white"
        >
          Добавить витрину
        </button>
      </div>
      <p className="mt-2 text-sm text-ink/55">
        Ник из Инстаграма или Telegram. Отметьте средства — это её каталог и
        ссылка для рекламы. Если ничего не отмечено, на витрине весь склад.
      </p>
      <div className="mt-4 space-y-3">
        {authors.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-ink/60">Витрин пока нет</p>
        ) : null}
        {authors.map((author) => (
          <article
            key={author.id || author.slug}
            className="flex flex-col gap-3 rounded-2xl bg-white p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="font-medium">{author.name}</div>
              <div className="mt-1 text-ink/50">
                /a/{author.slug}
                {author.skus && author.skus.length > 0
                  ? ` · ${author.skus.length} средств`
                  : ' · весь склад'}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => copyLink(author.slug)}
                className="min-h-10 rounded-full border border-stone-200 px-4 py-2"
              >
                {copied === author.slug ? 'Скопировано' : 'Ссылка'}
              </button>
              <button
                onClick={() => open(author)}
                className="min-h-10 rounded-full bg-lavender-full px-4 py-2 text-white"
              >
                Каталог
              </button>
            </div>
          </article>
        ))}
      </div>

      {editor ? (
        <div
          className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-ink/40 p-4"
          onClick={() => setEditor(null)}
        >
          <form
            onSubmit={onSubmit}
            onClick={(event) => event.stopPropagation()}
            className="my-8 w-full max-w-2xl space-y-4 rounded-2xl bg-white p-5 md:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-medium">
                {editor === 'new' ? 'Новая витрина' : 'Каталог блогера'}
              </h3>
              <button
                type="button"
                onClick={() => setEditor(null)}
                className="text-sm text-ink/50"
              >
                Закрыть
              </button>
            </div>
            <label className="block text-sm">
              Ник из соцсети
              <input
                required
                minLength={2}
                value={handle}
                onChange={(event) => setHandle(event.target.value)}
                placeholder="@masha"
                className="field mt-1"
              />
            </label>
            <div>
              <p className="text-sm">Средства на витрине</p>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Найти средство"
                className="field mt-2"
              />
              <p className="mt-2 text-xs text-ink/45">
                {skus.length > 0
                  ? `Отмечено ${skus.length}`
                  : 'Ничего не отмечено — на витрине весь склад'}
              </p>
              <div className="mt-3 max-h-80 space-y-1 overflow-y-auto">
                {visibleProducts.map((product) => (
                  <label
                    key={product.sku}
                    className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2 text-sm hover:bg-cream/80"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={skus.includes(product.sku)}
                      onChange={() => toggle(product.sku)}
                    />
                    <span>
                      {product.name}
                      {!product.active ? (
                        <span className="text-ink/40"> · скрыт</span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              disabled={saving}
              className="btn btn-primary min-h-12 w-full"
            >
              {saving ? 'Сохраняем…' : 'Сохранить'}
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
