import { Product } from './types';

export function searchProducts(products: Product[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return products;
  }

  return products.filter((product) =>
    [
      product.name,
      product.description,
      product.ingredients,
      product.forWhom,
      product.sku,
    ]
      .join(' ')
      .toLowerCase()
      .includes(q),
  );
}
