'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = query.trim();
    router.push(next ? `/?q=${encodeURIComponent(next)}#catalog` : '/#catalog');
  }

  return (
    <form onSubmit={onSubmit} className="min-w-0 flex-1 basis-0 overflow-hidden max-w-sm">
      <label className="sr-only" htmlFor="header-search">
        Поиск по каталогу
      </label>
      <input
        id="header-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Поиск"
        enterKeyHint="search"
        className="field h-11 min-w-0 max-w-full py-2"
      />
    </form>
  );
}
