export const AUTHOR_PERCENT = 10;
export const DELIVERY_PRICE = 350;
export const FREE_DELIVERY_FROM = 2500;

export function deliveryPrice(itemsTotal: number) {
  return itemsTotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_PRICE;
}
