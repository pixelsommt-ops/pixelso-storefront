// Verifikasi builder schema produk memakai data katalog PRODUCTION yang sebenarnya.
//
// Project ini belum punya test framework (tidak ada vitest/jest di package.json) dan menambah
// dependency di luar scope task, jadi ini script node biasa:
//   node scripts/verify-product-schema.mjs
//
// Yang diperiksa: bentuk schema valid, harga akurat, dan TIDAK ada rating palsu.

import { readFileSync } from 'node:fs';
import { buildProductSchema, buildBreadcrumbSchema } from '../src/lib/productSchema.js';

const CATALOG_URL = 'https://www.cetakpixelso.com/api/storefront/catalog';

let failures = 0;
let checks = 0;

function check(label, condition, detail = '') {
  checks += 1;
  if (!condition) {
    failures += 1;
    console.log(`  FAIL  ${label}${detail ? ` -> ${detail}` : ''}`);
  }
}

async function loadCatalog() {
  try {
    const res = await fetch(CATALOG_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    return body.data ?? body;
  } catch (err) {
    console.log(`Gagal fetch katalog live (${err.message}), pakai cache /tmp/cat.json`);
    const body = JSON.parse(readFileSync('/tmp/cat.json', 'utf8'));
    return body.data ?? body;
  }
}

const catalog = await loadCatalog();
const products = catalog.products ?? [];
console.log(`Produk diuji: ${products.length}\n`);

for (const product of products) {
  const schema = buildProductSchema(product);
  const crumb = buildBreadcrumbSchema(product);
  const tag = `[${product.key}]`;

  check(`${tag} schema Product terbentuk`, schema !== null);
  if (!schema) continue;

  check(`${tag} @type Product`, schema['@type'] === 'Product');
  check(`${tag} name terisi`, typeof schema.name === 'string' && schema.name.length > 0);
  check(`${tag} url absolut`, /^https:\/\/www\.cetakpixelso\.com\/produk\//.test(schema.url));

  // Kebijakan: tidak boleh ada rating/review karangan.
  check(`${tag} TIDAK ada aggregateRating palsu`, schema.aggregateRating === undefined);
  check(`${tag} TIDAK ada review palsu`, schema.review === undefined);

  // Deskripsi tidak boleh menyisakan tag HTML mentah.
  if (schema.description) {
    check(`${tag} description bersih dari HTML`, !/[<>]/.test(schema.description), schema.description.slice(0, 60));
  }

  // Semua image wajib absolut.
  if (schema.image) {
    const allAbsolute = schema.image.every((u) => /^https?:\/\//.test(u));
    check(`${tag} semua image absolut`, allAbsolute, JSON.stringify(schema.image.slice(0, 1)));
  }

  // Harga harus cocok dengan baseRate asli; produk tanpa harga tidak boleh punya offers.
  const baseRate = Number(product.baseRate);
  if (Number.isFinite(baseRate) && baseRate > 0) {
    check(`${tag} offers ada`, Boolean(schema.offers));
    check(`${tag} lowPrice == baseRate`, schema.offers?.lowPrice === baseRate, `${schema.offers?.lowPrice} vs ${baseRate}`);
    check(`${tag} currency IDR`, schema.offers?.priceCurrency === 'IDR');
    const expected = product.active === false
      ? 'https://schema.org/OutOfStock'
      : 'https://schema.org/InStock';
    check(`${tag} availability sesuai status aktif`, schema.offers?.availability === expected);
  } else {
    check(`${tag} produk tanpa harga TIDAK punya offers`, schema.offers === undefined);
  }

  // Breadcrumb: posisi berurutan mulai 1, item terakhir = produk itu sendiri.
  check(`${tag} breadcrumb terbentuk`, crumb !== null);
  if (crumb) {
    const list = crumb.itemListElement;
    const positionsOk = list.every((item, i) => item.position === i + 1);
    check(`${tag} posisi breadcrumb urut`, positionsOk);
    check(`${tag} breadcrumb mulai Beranda`, list[0].name === 'Beranda');
    check(`${tag} breadcrumb berakhir di produk`, list[list.length - 1].name === product.name);
    const expectedLen = product.category ? 4 : 3;
    check(`${tag} jumlah level breadcrumb`, list.length === expectedLen, `${list.length} vs ${expectedLen}`);
  }
}

// Kasus tepi: input rusak tidak boleh melempar error.
check('produk null aman', buildProductSchema(null) === null);
check('produk kosong aman', buildProductSchema({}) === null);
check('breadcrumb null aman', buildBreadcrumbSchema(null) === null);
check('produk tanpa name aman', buildProductSchema({ key: 'x' }) === null);

console.log(`\n${checks - failures}/${checks} pemeriksaan lolos`);
if (failures > 0) {
  console.log(`${failures} GAGAL`);
  process.exit(1);
}
console.log('SEMUA LOLOS');

// Contoh output untuk ditempel ke Google Rich Results Test
const sample = products.find((p) => p.key === 'banner');
if (sample) {
  console.log('\n--- contoh schema: banner ---');
  console.log(JSON.stringify(buildProductSchema(sample), null, 2));
  console.log(JSON.stringify(buildBreadcrumbSchema(sample), null, 2));
}
