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
    <form onSubmit={onSubmit} className="hidden min-w-[220px] flex-1 max-w-sm md:block">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Поиск по каталогу"
        className="field py-2"
      />
    </form>
  );
}
