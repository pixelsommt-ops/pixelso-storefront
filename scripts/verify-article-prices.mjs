// Verifikasi contoh hitungan harga yang dipakai di artikel blog, memakai kalkulator ASLI
// (src/lib/calculator.js) dan katalog production - supaya angka di artikel tidak pernah
// menyimpang dari yang dilihat pelanggan di halaman produk.
//
//   node scripts/verify-article-prices.mjs

import { readFileSync } from 'node:fs';
import { calculatePrintPrice } from '../src/lib/calculator.js';

const CATALOG_URL = 'https://www.cetakpixelso.com/api/storefront/catalog';

async function loadCatalog() {
  try {
    const res = await fetch(CATALOG_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    return body.data ?? body;
  } catch (err) {
    console.log(`(katalog live gagal: ${err.message}, pakai /tmp/cat.json)`);
    const body = JSON.parse(readFileSync('/tmp/cat.json', 'utf8'));
    return body.data ?? body;
  }
}

const catalog = await loadCatalog();
const banner = catalog.products.find((p) => p.key === 'banner');
const bahanGroup = banner.optionGroups.find((g) => g.label === 'Bahan');

function idr(n) {
  return `Rp${n.toLocaleString('id-ID')}`;
}

const ukuran = [
  { w: 100, h: 100, label: '1 x 1 m' },
  { w: 200, h: 100, label: '2 x 1 m' },
  { w: 300, h: 100, label: '3 x 1 m' },
  { w: 400, h: 100, label: '4 x 1 m' },
  { w: 100, h: 50, label: '1 x 0,5 m' },
];

console.log('TABEL HARGA BANNER — dihitung dengan kalkulator asli + katalog production\n');

const hasil = {};
for (const choice of bahanGroup.choices) {
  console.log(`--- ${choice.label} (${idr(choice.priceValue)}/m²) ---`);
  hasil[choice.label] = {};
  for (const u of ukuran) {
    const r = calculatePrintPrice(catalog, {
      productKey: 'banner',
      width: u.w,
      height: u.h,
      quantity: 1,
      selections: { [bahanGroup.id]: choice.id },
      needDesign: false,
    });
    hasil[choice.label][u.label] = r.total;
    const luas = (u.w / 100) * (u.h / 100);
    const catatan = r.billedArea > luas ? `  (luas ${luas} m² dibulatkan ke minimal ${r.billedArea} m²)` : '';
    console.log(`   ${u.label.padEnd(11)} ${idr(r.total).padStart(11)}${catatan}`);
  }
  console.log();
}

// Cek konsistensi: harga 2x1 harus tepat 2x harga 1x1 (tidak ada biaya tersembunyi)
console.log('--- PEMERIKSAAN KONSISTENSI ---');
let gagal = 0;
for (const [bahan, rows] of Object.entries(hasil)) {
  const satu = rows['1 x 1 m'];
  const dua = rows['2 x 1 m'];
  const tiga = rows['3 x 1 m'];
  const ok = dua === satu * 2 && tiga === satu * 3;
  if (!ok) gagal += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${bahan}: 2x1 = 2x(1x1), 3x1 = 3x(1x1)`);
}

// Cek minimal 1 m² benar-benar berlaku
const kecil = calculatePrintPrice(catalog, {
  productKey: 'banner', width: 50, height: 50, quantity: 1,
  selections: { [bahanGroup.id]: bahanGroup.choices[0].id }, needDesign: false,
});
const okMin = kecil.total === 20000;
if (!okMin) gagal += 1;
console.log(`${okMin ? 'PASS' : 'FAIL'}  Banner 0,5x0,5 m ditagih minimal 1 m² = ${idr(kecil.total)}`);

// Biaya desain
console.log(`\nBiaya desain (designFee): ${idr(catalog.designFee ?? 0)}`);
const denganDesain = calculatePrintPrice(catalog, {
  productKey: 'banner', width: 200, height: 100, quantity: 1,
  selections: { [bahanGroup.id]: bahanGroup.choices[0].id }, needDesign: true,
});
console.log(`Banner 2x1 m + minta dibuatkan desain = ${idr(denganDesain.total)}`);

console.log(`\n${gagal === 0 ? 'SEMUA KONSISTEN' : `${gagal} MASALAH`}`);
process.exit(gagal === 0 ? 0 : 1);
