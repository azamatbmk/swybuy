import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'products');
mkdirSync(dir, { recursive: true });

const products = [
  ['placeholder', '#A283E0', 'SwyBuy'],
  ['cleanse01', '#8BB8B3', 'Гель'],
  ['toner01', '#8FA6CF', 'Тонер'],
  ['serum01', '#C4A4DC', 'Сыворотка'],
  ['serum02', '#D9A8BE', 'Гиалурон'],
  ['cream01', '#D9CDEA', 'День'],
  ['cream02', '#B7A8C9', 'Ночь'],
  ['spf01', '#E2C36A', 'SPF'],
  ['mask01', '#C9896A', 'Маска'],
  ['patches01', '#E8B9AE', 'Патчи'],
  ['oil01', '#C89A55', 'Масло'],
  ['mist01', '#8FCBBF', 'Мист'],
  ['balm01', '#D98FA0', 'Бальзам'],
];

function svg(color, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000" fill="none">
  <rect width="800" height="1000" fill="#F7F3F0"/>
  <ellipse cx="400" cy="820" rx="190" ry="28" fill="#2B2430" fill-opacity=".06"/>
  <rect x="318" y="168" width="164" height="78" rx="22" fill="#2B2430"/>
  <rect x="346" y="148" width="108" height="36" rx="12" fill="#2B2430"/>
  <rect x="230" y="236" width="340" height="520" rx="92" fill="${color}"/>
  <rect x="230" y="236" width="340" height="150" rx="92" fill="#ffffff" fill-opacity=".18"/>
  <rect x="286" y="430" width="228" height="150" rx="24" fill="#FBFAFA" fill-opacity=".55"/>
  <text x="400" y="518" text-anchor="middle" fill="#2B2430" font-family="Georgia, serif" font-size="34">${label}</text>
</svg>
`;
}

for (const [sku, color, label] of products) {
  writeFileSync(join(dir, `${sku}.svg`), svg(color, label));
}

console.log(`wrote ${products.length} images to ${dir}`);
