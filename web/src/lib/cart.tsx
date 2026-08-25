'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { CartItem, Product } from './types';

const STORAGE_KEY = 'swybuy_cart';

type CartContextValue = {
  items: CartItem[];
  add: (product: Product, quantity?: number) => void;
  setQuantity: (sku: string, quantity: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
  count: number;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setItems(JSON.parse(raw) as CartItem[]);
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

  const value = useMemo<CartContextValue>(() => {
    const add = (product: Product, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((item) => item.sku === product.sku);
        if (existing) {
          return current.map((item) =>
            item.sku === product.sku
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + quantity, product.stock),
                }
              : item,
          );
        }
        return [
          ...current,
          {
            sku: product.sku,
            slug: product.slug,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: Math.min(quantity, product.stock),
            stock: product.stock,
          },
        ];
      });
    };

    return {
      items,
      add,
      setQuantity: (sku, quantity) => {
        setItems((current) =>
          current
            .map((item) =>
              item.sku === sku
                ? { ...item, quantity: Math.min(Math.max(quantity, 0), item.stock) }
                : item,
            )
            .filter((item) => item.quantity > 0),
        );
      },
      remove: (sku) => {
        setItems((current) => current.filter((item) => item.sku !== sku));
      },
      clear: () => setItems([]),
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart outside provider');
  }
  return context;
}
