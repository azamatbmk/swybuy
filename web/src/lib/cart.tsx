'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { CartItem, Product, sellingPrice } from './types';

const STORAGE_KEY = 'swybuy_cart';

type CartContextValue = {
  ready: boolean;
  items: CartItem[];
  add: (product: Product, quantity?: number) => void;
  replaceWith: (product: Product, quantity?: number) => void;
  setQuantity: (sku: string, quantity: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
  syncFromCatalog: (catalog: Product[]) => void;
  count: number;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function toCartItem(product: Product, quantity: number): CartItem {
  const pay = sellingPrice(product);
  const list = product.price;
  return {
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    price: pay,
    listPrice: list > pay ? list : undefined,
    imageUrl: product.imageUrl,
    quantity: Math.min(Math.max(quantity, 1), product.stock),
    stock: product.stock,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        setItems(
          Array.isArray(parsed)
            ? parsed.filter(
                (item) =>
                  item &&
                  typeof item.sku === 'string' &&
                  Number.isFinite(item.quantity) &&
                  item.quantity > 0,
              )
            : [],
        );
      }
    } catch {
      setItems([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, ready]);

  const add = useCallback((product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      return;
    }
    setItems((current) => {
      const existing = current.find((item) => item.sku === product.sku);
      if (existing) {
        return current.map((item) =>
          item.sku === product.sku
            ? {
                ...item,
                price: sellingPrice(product),
                listPrice:
                  product.price > sellingPrice(product)
                    ? product.price
                    : undefined,
                stock: product.stock,
                name: product.name,
                imageUrl: product.imageUrl,
                quantity: Math.min(item.quantity + quantity, product.stock),
              }
            : item,
        );
      }
      return [...current, toCartItem(product, quantity)];
    });
  }, []);

  const replaceWith = useCallback((product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      return;
    }
    setItems([toCartItem(product, quantity)]);
  }, []);

  const setQuantity = useCallback((sku: string, quantity: number) => {
    const next = Number(quantity);
    if (!Number.isFinite(next)) {
      return;
    }
    setItems((current) =>
      current
        .map((item) =>
          item.sku === sku
            ? {
                ...item,
                quantity: Math.min(Math.max(Math.round(next), 0), item.stock),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const remove = useCallback((sku: string) => {
    setItems((current) => current.filter((item) => item.sku !== sku));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const syncFromCatalog = useCallback((catalog: Product[]) => {
    const bySku = new Map(catalog.map((product) => [product.sku, product]));
    setItems((current) =>
      current.flatMap((item) => {
        const product = bySku.get(item.sku);
        if (!product || !product.active || product.stock <= 0) {
          return [];
        }
        return [
          {
            ...item,
            slug: product.slug,
            name: product.name,
            price: sellingPrice(product),
            listPrice:
              product.price > sellingPrice(product)
                ? product.price
                : undefined,
            imageUrl: product.imageUrl,
            stock: product.stock,
            quantity: Math.min(item.quantity, product.stock),
          },
        ];
      }),
    );
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      ready,
      items,
      add,
      replaceWith,
      setQuantity,
      remove,
      clear,
      syncFromCatalog,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    [
      add,
      clear,
      items,
      ready,
      remove,
      replaceWith,
      setQuantity,
      syncFromCatalog,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart outside provider');
  }
  return context;
}
