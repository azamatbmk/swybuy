const KEY = 'swybuy.shelves';

function readAll(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function saveShelfToken(slug: string, token: string) {
  const all = readAll();
  all[slug] = token;
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function readShelfToken(slug: string) {
  return readAll()[slug] || '';
}
