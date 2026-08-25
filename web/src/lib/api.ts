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
      credentials: 'include',
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
  order: (id: string, token: string) =>
    request<Order>(`/orders/${id}`, {
      headers: { 'x-order-token': token },
    }),
  shelf: (slug: string) => request<Shelf>(`/shelves/${slug}`),
  publishShelf: (
    orderId: string,
    body: { name: string; skus: string[]; orderToken: string; token?: string },
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
  mockPay: (orderId: string, token: string) =>
    request<Order>(`/payments/mock/${orderId}`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  payAgain: (orderId: string, token: string) =>
    request<{ paymentUrl: string }>(`/orders/${orderId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  adminLogin: (key: string) =>
    request<{ ok: boolean }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ key }),
    }),
  adminLogout: () =>
    request<{ ok: boolean }>('/admin/logout', { method: 'POST' }),
  adminPing: () => request<{ ok: boolean }>('/admin/ping'),
  adminOrders: () => request<Order[]>('/admin/orders'),
  adminProducts: () => request<Product[]>('/admin/products'),
  updateOrder: (id: string, body: { status?: string; trackNumber?: string }) =>
    request<Order>(`/admin/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  createProduct: (body: Record<string, unknown>) =>
    request<Product>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateProduct: (id: string, body: Record<string, unknown>) =>
    request<Product>(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};
