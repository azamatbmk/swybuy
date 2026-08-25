const KEY = 'swybuy.orders';

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

export function saveOrderToken(id: string, token: string) {
  const all = readAll();
  all[id] = token;
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function readOrderToken(id: string) {
  return readAll()[id] || '';
}
