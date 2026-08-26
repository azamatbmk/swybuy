export function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(90, Math.max(0, Math.round(value)));
}

export function effectiveDiscount(
  own: number | null | undefined,
  settings: { globalDiscountOn: boolean; globalDiscountPercent: number },
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
