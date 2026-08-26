export type DiscountSettings = {
  globalDiscountOn: boolean;
  globalDiscountPercent: number;
};

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(90, Math.max(0, Math.round(value)));
}

export function effectiveDiscount(
  own: number | null | undefined,
  settings: DiscountSettings,
) {
  if (own !== null && own !== undefined) {
    return clampPercent(own);
  }
  if (settings.globalDiscountOn) {
    return clampPercent(settings.globalDiscountPercent);
  }
  return 0;
}

export function salePrice(listPrice: number, percent: number) {
  if (percent <= 0) {
    return listPrice;
  }
  return Math.max(0, Math.round((listPrice * (100 - percent)) / 100));
}

export function withSale<
  T extends { price: number; discountPercent?: number | null },
>(product: T, settings: DiscountSettings) {
  const discountPercent = effectiveDiscount(product.discountPercent, settings);
  return {
    ...product,
    salePrice: salePrice(product.price, discountPercent),
    discountPercent,
    ownDiscountPercent:
      product.discountPercent === undefined ? null : product.discountPercent,
  };
}
