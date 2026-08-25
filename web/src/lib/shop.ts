import { Product } from './types';

export const DELIVERY_PRICE = 350;
export const FREE_DELIVERY_FROM = 2500;

export function deliveryPrice(itemsTotal: number) {
  return itemsTotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_PRICE;
}

export function toFreeDelivery(itemsTotal: number) {
  return Math.max(0, FREE_DELIVERY_FROM - itemsTotal);
}

export const ROUTINES = [
  {
    id: 'barrier',
    title: 'Барьер',
    text: 'Мягкое умывание, кремовый тонер и церамиды',
    skus: ['celimax-madecica-foam', 'celimax-dual-toner', 'celimax-dual-cream'],
  },
  {
    id: 'pdrn',
    title: 'ПДРН',
    text: 'Восстановление и сияние без кислоты',
    skus: ['anua-pdrn-serum', 'althea-reju5000', 'vt-pdrn-essence'],
  },
  {
    id: 'acne',
    title: 'Рельеф и акне',
    text: 'Очищение, пэды и ретиноид на ночь',
    skus: ['celimax-cica-bha-foam', 'celimax-pore-pads', 'celimax-retinol-serum'],
  },
];

const PAIR_WITH: Record<string, string[]> = {
  'celimax-madecica-foam': ['celimax-dual-toner', 'althea-345-cream', 'celimax-dual-cream'],
  'celimax-cica-bha-foam': ['celimax-pore-pads', 'althea-147-cream', 'celimax-dual-toner'],
  'celimax-soda-foam': ['celimax-pore-pads', 'althea-bha-pads', 'celimax-dual-cream'],
  'celimax-dual-toner': ['celimax-dual-cream', 'anua-pdrn-serum', 'althea-345-serum'],
  'celimax-pore-pads': ['celimax-dual-cream', 'celimax-cica-bha-foam', 'althea-147-cream'],
  'althea-bha-pads': ['althea-345-cream', 'celimax-cica-bha-foam', 'celimax-dual-toner'],
  'anua-pdrn-serum': ['anua-pdrn-cream', 'vt-pdrn-toner', 'althea-reju5000'],
  'althea-aqua-serum': ['althea-aqua-cream', 'althea-345-mist', 'vt-pdrn-toner'],
  'althea-345-serum': ['althea-345-cream', 'althea-345-mist', 'celimax-dual-toner'],
  'celimax-retinol-serum': ['celimax-dual-cream', 'celimax-retinal-booster', 'celimax-madecica-foam'],
  'celimax-retinal-booster': ['celimax-dual-cream', 'celimax-retinol-serum', 'celimax-dual-toner'],
  'vt-pdrn-essence': ['vt-pdrn-capsule-cream', 'vt-pdrn-toner', 'vt-pdrn-stick'],
  'althea-reju5000': ['anua-pdrn-serum', 'celimax-dual-toner', 'althea-345-mist'],
  'celimax-dual-cream': ['celimax-dual-toner', 'celimax-madecica-foam', 'althea-345-serum'],
  'althea-345-cream': ['althea-345-serum', 'althea-345-mist', 'celimax-madecica-foam'],
  'althea-147-cream': ['althea-bha-pads', 'celimax-dual-toner', 'althea-345-mist'],
  'anua-pdrn-cream': ['anua-pdrn-serum', 'anua-pdrn-mist', 'vt-pdrn-toner'],
  'althea-aqua-cream': ['althea-aqua-serum', 'althea-345-mist', 'vt-pdrn-stick'],
  'vt-pdrn-capsule-cream': ['vt-pdrn-essence', 'vt-pdrn-glow-mist', 'vt-pdrn-toner'],
  'vt-pdrn-stick': ['vt-pdrn-essence', 'anua-pdrn-mist', 'althea-reju5000'],
  'althea-345-mist': ['althea-345-cream', 'althea-345-serum', 'vt-pdrn-stick'],
  'vt-pdrn-glow-mist': ['vt-pdrn-essence', 'vt-pdrn-capsule-cream', 'anua-pdrn-serum'],
  'anua-pdrn-mist': ['anua-pdrn-serum', 'anua-pdrn-cream', 'vt-pdrn-stick'],
  'vt-pdrn-toner': ['vt-pdrn-essence', 'vt-pdrn-capsule-cream', 'anua-pdrn-serum'],
  'vt-lip-plumper': ['vt-eye-lifter', 'vt-pdrn-stick', 'althea-345-cream'],
  'vt-eye-lifter': ['vt-lip-plumper', 'vt-pdrn-essence', 'anua-pdrn-mist'],
};

export function productsBySkus(catalog: Product[], skus: string[]) {
  return skus
    .map((sku) => catalog.find((product) => product.sku === sku))
    .filter((product): product is Product => Boolean(product));
}

export function relatedProducts(
  product: Product,
  catalog: Product[],
  limit = 3,
) {
  const preferred = new Set(PAIR_WITH[product.sku] || []);
  const others = catalog.filter(
    (item) => item.sku !== product.sku && item.stock > 0,
  );
  return [
    ...others.filter((item) => preferred.has(item.sku)),
    ...others.filter((item) => !preferred.has(item.sku)),
  ].slice(0, limit);
}

export function cartUpsells(cartSkus: string[], catalog: Product[], limit = 3) {
  const inCart = new Set(cartSkus);
  const hints = cartSkus.flatMap((sku) => PAIR_WITH[sku] || []);
  const preferred = new Set(hints);
  const available = catalog.filter(
    (item) => !inCart.has(item.sku) && item.stock > 0,
  );
  return [
    ...available.filter((item) => preferred.has(item.sku)),
    ...available.filter((item) => !preferred.has(item.sku)),
  ].slice(0, limit);
}
