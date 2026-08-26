export type Product = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  weightGrams: number;
  description: string;
  ingredients: string;
  forWhom: string;
  warning: string;
  imageUrl: string;
  active: boolean;
};

export type CartItem = {
  sku: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
};

export type Shelf = {
  name: string;
  slug: string;
  products: Product[];
};

export type ShelfPublish = {
  name: string;
  slug: string;
  token: string;
  skus: string[];
};

export type Author = {
  id?: string;
  slug: string;
  name: string;
  handle?: string;
  products?: Product[];
  skus?: string[];
};

export type OrderItem = {
  sku: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  status: string;
  ref: string | null;
  customerName: string;
  phone: string;
  email: string;
  city: string;
  street: string;
  house: string;
  apartment: string | null;
  deliveryType: string;
  paymentMethod?: string;
  deliveryPrice: number;
  itemsTotal: number;
  total: number;
  authorAmount: number;
  authorPercent: number;
  trackNumber: string | null;
  items: OrderItem[];
  author: Author | null;
  shelf?: { slug: string; name: string } | null;
  paymentUrl?: string;
  accessToken?: string;
  createdAt?: string;
  paidAt?: string | null;
};

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'paid',
  'packed',
  'shipped',
  'returned',
  'failed',
] as const;

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Ожидает оплату',
  confirmed: 'Наличными при получении',
  paid: 'Оплачен',
  packed: 'Собран',
  shipped: 'Отправлен',
  returned: 'Возврат',
  failed: 'Ошибка',
};

export function paymentMethodLabel(method?: string) {
  return method === 'cash' ? 'Наличными при получении' : 'Картой онлайн';
}

export function deliveryTypeLabel(type?: string) {
  void type;
  return 'Почта России';
}

export function formatPrice(value: number) {
  return `${value.toLocaleString('ru-RU')} ₽`;
}

export function formatDate(value?: string | null) {
  if (!value) {
    return '';
  }
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
