import { execFileSync } from 'child_process';
import { mkdirSync, readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', '..', 'web', 'public', 'products');
const jsonPath = join(__dirname, '..', 'prisma', 'hollyshop-products.json');
mkdirSync(outDir, { recursive: true });

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const CATALOG = [
  {
    sku: 'althea-reju5000',
    slug: 'althea-reju-5000-cream',
    url: 'https://hollyshop.ru/catalog/product/vosstanavlivayushchiy_krem_s_pdrn_dr_althea_reju_5000_cream/',
  },
  {
    sku: 'celimax-dual-cream',
    slug: 'celimax-dual-barrier-cream',
    url: 'https://hollyshop.ru/catalog/product/barernyy_krem_s_kompleksom_keramidov_celimax_dual_barrier_skin_wearable_cream/',
  },
  {
    sku: 'celimax-pore-pads',
    slug: 'celimax-pore-dark-spot-pads',
    url: 'https://hollyshop.ru/catalog/product/tonerpedy_dlya_vyravnivaniya_tona_i_relefa_kozhi_celimax_poredark_spot_brightening_pad_80_sht/',
  },
  {
    sku: 'celimax-retinal-booster',
    slug: 'celimax-retinal-shot-booster',
    url: 'https://hollyshop.ru/catalog/product/podtyagivayushchiy_buster_krem_s_retinalem_celimax_the_vita_a_retinal_shot_tightening_booster/',
  },
  {
    sku: 'celimax-retinol-serum',
    slug: 'celimax-retinol-shot-serum',
    url: 'https://hollyshop.ru/catalog/product/podtyagivayushchaya_syvorotka_s_retinolom_i_mikroiglami_celimax_the_vita_a_retinol_shot_tightening_s/',
  },
  {
    sku: 'celimax-dual-toner',
    slug: 'celimax-dual-barrier-toner',
    url: 'https://hollyshop.ru/catalog/product/barernyy_kremovyy_toner_celimax_dual_barrier_creamy_toner_/',
  },
  {
    sku: 'celimax-madecica-foam',
    slug: 'celimax-madecica-foam',
    url: 'https://hollyshop.ru/catalog/product/penka_dlya_glubokogo_ochishcheniya_chuvstvitelnoy_kozhi_celimax_derma_nature_relief_madecica_ph_bala/',
  },
  {
    sku: 'althea-345-cream',
    slug: 'althea-345-relief-cream',
    url: 'https://hollyshop.ru/catalog/product/vosstanavlivayushchiy_krem_s_resveratrolom_dr_althea_resveratrol_345_na_intensive_repair_cream/',
  },
  {
    sku: 'anua-pdrn-serum',
    slug: 'anua-pdrn-capsule-serum',
    url: 'https://hollyshop.ru/catalog/product/syvorotka_s_pdrn_dlya_siyaniya_kozhi_anua_pdrn_hyaluronic_acid_capsule_100_serum/',
  },
  {
    sku: 'althea-147-cream',
    slug: 'althea-147-barrier-cream',
    url: 'https://hollyshop.ru/catalog/product/uspokaivayushchiy_krem_s_azulenom_dr_althea_azulene_147_ha_intensive_soothing_cream/',
  },
  {
    sku: 'celimax-cica-bha-foam',
    slug: 'celimax-cica-bha-foam',
    url: 'https://hollyshop.ru/catalog/product/ochishchayushchaya_penka_s_bha_kislotoy_i_tsentelloy_celimax_ji_woo_gae_cica_bha_acne_foam_cleansing/',
  },
  {
    sku: 'anua-pdrn-cream',
    slug: 'anua-pdrn-moisturizing-cream',
    url: 'https://hollyshop.ru/catalog/product/uvlazhnyayushchiy_krem_s_pdrn_i_gialuronovoy_kislotoy_anua_pdrn_hyaluronic_acid_100_moisturizing_cre/',
  },
  {
    sku: 'althea-345-mist',
    slug: 'althea-345-relief-mist',
    url: 'https://hollyshop.ru/catalog/product/uspokaivayushchiy_mist_s_gidrolatom_risa_i_pantenolom_dr_althea_345_relief_cream_mist_100_ml/',
  },
  {
    sku: 'althea-aqua-cream',
    slug: 'althea-aqua-marine-cream',
    url: 'https://hollyshop.ru/catalog/product/krem_s_pdrn_i_bambukom_dlya_glubokogo_uvlazhneniya_dr_althea_aqua_marine_watery_cream/',
  },
  {
    sku: 'althea-aqua-serum',
    slug: 'althea-aqua-marine-serum',
    url: 'https://hollyshop.ru/catalog/product/syvorotka_s_pdrn_i_bambukom_dlya_glubokogo_uvlazhneniya_dr_althea_aqua_marine_deep_serum/',
  },
  {
    sku: 'vt-pdrn-stick',
    slug: 'vt-pdrn-essence-stick',
    url: 'https://hollyshop.ru/catalog/product/vosstanavlivayushchiy_stik_balzam_dlya_siyaniya_kozhi_vt_pdrn_essence_stick_balm/',
  },
  {
    sku: 'vt-pdrn-essence',
    slug: 'vt-pdrn-essence-100',
    url: 'https://hollyshop.ru/catalog/product/ukreplyayushchaya_buster_essentsiya_s_pdrn_vt_cosmetics_pdrn_essence_100/',
  },
  {
    sku: 'vt-pdrn-capsule-cream',
    slug: 'vt-pdrn-capsule-cream',
    url: 'https://hollyshop.ru/catalog/product/uvlazhnyayushchiy_kapsulnyy_krem_s_pdrn_vt_cosmetics_pdrn_capsule_cream_100/',
  },
  {
    sku: 'vt-lip-plumper',
    slug: 'vt-reedle-lip-plumper',
    url: 'https://hollyshop.ru/catalog/product/intensivnyy_plamper_dlya_gub_s_mikroiglami_vt_cosmetics_reedle_shot_lip_plumper_expert/',
  },
  {
    sku: 'althea-bha-pads',
    slug: 'althea-salicylic-clear-pads',
    url: 'https://hollyshop.ru/catalog/product/pedy_dlya_problemnoy_kozhi_s_2_salitsilovoy_kislotoy_dr_althea_2_salicylic_acid_clear_pad/',
  },
  {
    sku: 'vt-pdrn-glow-mist',
    slug: 'vt-pdrn-glow-ampoule',
    url: 'https://hollyshop.ru/catalog/product/ampulnyy_mist_dlya_siyaniya_kozhi_s_pdrn_vt_cosmetics_pdrn_reedle_glow_ampoule/',
  },
  {
    sku: 'vt-pdrn-toner',
    slug: 'vt-pdrn-toner',
    url: 'https://hollyshop.ru/catalog/product/uvlazhnyayushchiy_toner_dlya_litsa_s_pdrn_vt_cosmetics_pdrn_toner/',
  },
  {
    sku: 'vt-eye-lifter',
    slug: 'vt-reedle-eye-lifter',
    url: 'https://hollyshop.ru/catalog/product/krem_dlya_kozhi_vokrug_glaz_s_zolotom_vt_cosmetics_reedle_shot_eye_lifter/',
  },
  {
    sku: 'anua-pdrn-mist',
    slug: 'anua-pdrn-hydrating-mist',
    url: 'https://hollyshop.ru/catalog/product/uvlazhnyayushchiy_kapsulnyy_mist_s_pdrn_i_gialuronovoy_kislotoy_anua_pdrn_hyaluronic_acid_hydrating_/',
  },
  {
    sku: 'celimax-soda-foam',
    slug: 'celimax-baking-soda-foam',
    url: 'https://hollyshop.ru/catalog/product/penka_dlya_glubokogo_ochishcheniya_s_sodoy_celimax_jiwoogae_baking_soda_deep_pore_foam_cleansing/',
  },
  {
    sku: 'althea-345-serum',
    slug: 'althea-345-relief-serum',
    url: 'https://hollyshop.ru/catalog/product/lyegkaya_uspokaivayushchaya_syvorotka_dr_althea_345_relief_serum/',
  },
];

function decode(html) {
  return html
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function strip(html) {
  return decode(
    html
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(p|div|li|h\d)>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  );
}

function curl(url, dest) {
  execFileSync(
    'curl.exe',
    [
      '-sL',
      '--max-time',
      '40',
      '-A',
      UA,
      '-H',
      'Accept-Language: ru-RU,ru;q=0.9',
      '-H',
      'Referer: https://hollyshop.ru/',
      '-o',
      dest,
      url,
    ],
    { stdio: 'pipe' },
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tab(html, rel) {
  const re = new RegExp(
    `<div class="tabs__item" data-rel="${rel}">([\\s\\S]*?)</div>`,
  );
  return html.match(re)?.[1] || '';
}

function spec(html, label) {
  const re = new RegExp(`<em>${label}</em><strong>([^<]+)</strong>`);
  return decode(html.match(re)?.[1] || '');
}

function originalImage(og) {
  if (!og) return '';
  return og.replace(
    /\/upload\/resize_cache\/iblock\/([^/]+)\/([^/]+)\/\d+_\d+_\d+\//,
    '/upload/iblock/$1/$2/',
  );
}

function warningFrom(name, ingredients) {
  const n = `${name} ${ingredients}`.toLowerCase();
  if (n.includes('ретинал') || n.includes('ретинол') || n.includes('retinal') || n.includes('retinol')) {
    return 'Ретиноид: вечером, SPF днём. Не смешивать с кислотами без схемы. Не при беременности.';
  }
  if (n.includes('salicylic') || n.includes('bha') || n.includes('салицил')) {
    return 'Кислота: не сочетать с ретинолом в один вечер, днём SPF.';
  }
  if (n.includes('микроигл') || n.includes('reedle') || n.includes('спикул')) {
    return 'Микроиглы: не наносить на повреждённую кожу, без кислот и ретинола в этот вечер.';
  }
  return '';
}

function sentences(text, max = 3) {
  const parts = text
    .replace(/Основные действующие.*$/i, '')
    .replace(/Способ применения.*$/i, '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40);
  return parts.slice(0, max).join(' ');
}

function parseProduct(html, item) {
  if (/Checking your browser/i.test(html) || html.length < 20000) {
    throw new Error('browser check or empty page');
  }

  const name = decode(html.match(/<h1 class="product__heading">([^<]+)<\/h1>/)?.[1] || '');
  const price = Number(
    html.match(/\$\.mindbox\('Website\.ViewProduct'[\s\S]*?"price":(\d+)/)?.[1] ||
      html.match(/data-total="(\d+)"/)?.[1] ||
      html.match(/product__buy-price-item-last">([\d\s]+)/)?.[1]?.replace(/\D/g, '') ||
      0,
  );
  const soldOut = html.includes('product__buy-sold-out');
  const og = html.match(/property="og:image" content="([^"]+)"/)?.[1] || '';
  const sourceImage = originalImage(og);

  const shortHtml = html.match(
    /show-hide__body _show">[\s\S]*?<div>([\s\S]*?)<\/div>/,
  )?.[1];
  const longHtml = tab(html, 'description');
  const description =
    sentences(strip(shortHtml || ''), 3) ||
    sentences(strip(longHtml), 3) ||
    name;

  const ingredients = strip(tab(html, 'ingredients'));
  const weightRaw = spec(html, 'Вес \\(гр\\)').replace(',', '.');
  const volumeRaw = spec(html, 'Объём \\(мл\\)');
  const weightGrams = Math.max(
    20,
    Math.round(Number(weightRaw) || Number(volumeRaw) || 80),
  );
  const skin = spec(html, 'Тип кожи')
    .replace(/для /g, '')
    .replace(/кожи/g, 'кожа')
    .replace(/,\s*/g, ', ');
  const forWhom = skin || 'Все типы кожи';

  return {
    sku: item.sku,
    slug: item.slug,
    name,
    price,
    stock: soldOut ? 0 : 8,
    weightGrams,
    description: description.slice(0, 900),
    ingredients,
    forWhom,
    warning: warningFrom(name, ingredients),
    imageUrl: `/products/${item.sku}.jpg`,
    sourceImage,
  };
}

const products = [];
for (const [index, item] of CATALOG.entries()) {
  process.stdout.write(`${index + 1}/${CATALOG.length} ${item.sku}\n`);
  const htmlPath = join(tmpdir(), `holly-${item.sku}.html`);
  let product;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      curl(item.url, htmlPath);
      const html = readFileSync(htmlPath, 'utf8');
      product = parseProduct(html, item);
      break;
    } catch (error) {
      console.warn(`  retry ${attempt + 1}: ${error.message}`);
      await sleep(1500);
    }
  }
  if (existsSync(htmlPath)) unlinkSync(htmlPath);
  if (!product) {
    throw new Error(`failed ${item.sku}`);
  }

  const dest = join(outDir, `${item.sku}.jpg`);
  if (product.sourceImage) {
    try {
      curl(product.sourceImage, dest);
    } catch (error) {
      console.warn('  image fail', product.sourceImage, error.message);
      product.imageUrl = '/products/placeholder.svg';
    }
  } else {
    product.imageUrl = '/products/placeholder.svg';
  }
  delete product.sourceImage;
  products.push(product);
  await sleep(350);
}

writeFileSync(jsonPath, JSON.stringify(products, null, 2), 'utf8');
console.log('wrote', jsonPath, products.length);
for (const p of products) {
  console.log(
    `${p.sku}\t${p.price}\t${p.stock}\tinci=${p.ingredients ? p.ingredients.slice(0, 24) : 'EMPTY'}\t${p.name.slice(0, 60)}`,
  );
}
