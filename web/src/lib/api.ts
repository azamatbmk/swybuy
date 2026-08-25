import { Author, Order, Product, Shelf, ShelfPublish } from './types';

function apiBase() {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  }
  return '/backend';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBase()}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      cache: 'no-store',
    });
  } catch {
    throw new Error(
      'Не удалось связаться с API. Запусти `npm run dev:api` и обнови страницу.',
    );
  }

  if (!response.ok) {
    let message = 'Ошибка запроса';
    try {
      const payload = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(payload.message)) {
        message = payload.message.join(', ');
      } else if (payload.message) {
        message = payload.message;
      }
    } catch {
      message = response.statusText;
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  products: () => request<Product[]>('/products'),
  product: (slug: string) => request<Product>(`/products/${slug}`),
  author: (slug: string) => request<Author>(`/authors/${slug}`),
  order: (id: string) => request<Order>(`/orders/${id}`),
  shelf: (slug: string) => request<Shelf>(`/shelves/${slug}`),
  publishShelf: (
    orderId: string,
    body: { name: string; skus: string[]; token?: string },
  ) =>
    request<ShelfPublish>(`/shelves/from-order/${orderId}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateShelf: (
    slug: string,
    body: { token: string; name?: string; skus?: string[] },
  ) =>
    request<Shelf>(`/shelves/${slug}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  createOrder: (body: Record<string, unknown>) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  mockPay: (orderId: string) =>
    request<Order>(`/payments/mock/${orderId}`, { method: 'POST' }),
  adminPing: (key: string) =>
    request<{ ok: boolean }>('/admin/ping', { headers: { 'x-admin-key': key } }),
  adminOrders: (key: string) =>
    request<Order[]>('/admin/orders', { headers: { 'x-admin-key': key } }),
  adminProducts: (key: string) =>
    request<Product[]>('/admin/products', { headers: { 'x-admin-key': key } }),
  updateOrder: (
    key: string,
    id: string,
    body: { status?: string; trackNumber?: string },
  ) =>
    request<Order>(`/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'x-admin-key': key },
      body: JSON.stringify(body),
    }),
  createProduct: (key: string, body: Record<string, unknown>) =>
    request<Product>('/admin/products', {
      method: 'POST',
      headers: { 'x-admin-key': key },
      body: JSON.stringify(body),
    }),
  updateProduct: (key: string, id: string, body: Record<string, unknown>) =>
    request<Product>(`/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'x-admin-key': key },
      body: JSON.stringify(body),
    }),
};
