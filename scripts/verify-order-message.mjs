// Verifikasi pesan WhatsApp pesanan dibangun benar untuk SEMUA produk aktif di katalog
// production, memakai kalkulator asli (bukan hitung manual).
//
//   node scripts/verify-order-message.mjs
//
// Yang dijaga: harga di pesan selalu sama dengan yang dilihat pelanggan di form, dan
// tidak ada harga yang muncul saat perhitungan belum valid.

import { readFileSync } from 'node:fs';
import { calculatePrintPrice } from '../src/lib/calculator.js';

// orderMessage.js meng-import './format' tanpa ekstensi (gaya Vite). Node ESM butuh ekstensi
// eksplisit, jadi modulnya dimuat lewat loader kecil di bawah alih-alih import langsung -
// kode produksinya sendiri TIDAK diubah hanya demi skrip verifikasi ini.
const { buildOrderMessage } = await (async () => {
  const src = readFileSync(new URL('../src/lib/orderMessage.js', import.meta.url), 'utf8')
    .replace("from './format'", "from './format.js'");
  const tmpPath = new URL('../src/lib/__orderMessage.verify.js', import.meta.url);
  const { writeFileSync, unlinkSync } = await import('node:fs');
  writeFileSync(tmpPath, src);
  try {
    return await import(tmpPath.href);
  } finally {
    unlinkSync(tmpPath);
  }
})();

const CATALOG_URL = 'https://www.cetakpixelso.com/api/storefront/catalog';

let failures = 0;
let checks = 0;
function check(label, ok, detail = '') {
  checks += 1;
  if (!ok) {
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
    console.log(`(katalog live gagal: ${err.message}, pakai /tmp/cat.json)`);
    return JSON.parse(readFileSync('/tmp/cat.json', 'utf8')).data;
  }
}

const catalog = await loadCatalog();
const products = catalog.products.filter((p) => p.active);
console.log(`Produk diuji: ${products.length}\n`);

function defaultSelections(product) {
  const sel = {};
  (product.optionGroups || []).forEach((g) => {
    const c = g.choices.find((x) => x.isDefault) || g.choices[0];
    if (c) sel[g.id] = c.id;
  });
  return sel;
}

for (const product of products) {
  const isArea = (product.calcType || product.mode) === 'area';
  const form = {
    width: isArea ? 200 : '',
    height: isArea ? 100 : '',
    quantity: 2,
    needDesign: false,
  };
  const selections = defaultSelections(product);
  const result = calculatePrintPrice(catalog, { ...form, selections, productKey: product.key });
  const msg = buildOrderMessage(product, result, form, catalog.designFee);
  const tag = `[${product.key}]`;

  check(`${tag} menyebut nama produk`, msg.includes(product.name), msg.slice(0, 60));
  check(`${tag} ada salam pembuka`, msg.startsWith('Halo Pixelso'));
  check(`${tag} ada penutup`, msg.includes('Terima kasih'));
  check(`${tag} menyebut jumlah`, /Jumlah: 2/.test(msg));

  if (isArea) {
    check(`${tag} menyebut ukuran`, msg.includes('Ukuran: 200 x 100 cm'), msg);
  }

  // Setiap grup opsi wajib muncul dengan label yang benar.
  (result.selectedOptionsSnapshot || []).forEach((opt) => {
    check(`${tag} opsi "${opt.groupLabel}"`, msg.includes(`${opt.groupLabel}: ${opt.choiceLabel}`));
  });

  // Harga di pesan harus SAMA PERSIS dengan hasil kalkulator.
  if (result.valid && result.total > 0) {
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(result.total);
    check(`${tag} estimasi cocok kalkulator`, msg.includes(formatted),
      `harap ${formatted} | pesan: ${msg.split('\n').find((l) => l.startsWith('Estimasi'))}`);
  }
}

// --- Kasus tepi ---
console.log('Kasus tepi:');
const banner = products.find((p) => p.key === 'banner');
const bahan = banner.optionGroups[0];

// Form kosong: perhitungan tidak valid -> TIDAK boleh menyebut harga.
const kosong = calculatePrintPrice(catalog, {
  width: '', height: '', quantity: 1, selections: { [bahan.id]: bahan.choices[0].id }, productKey: 'banner',
});
const msgKosong = buildOrderMessage(banner, kosong, { width: '', height: '', quantity: 1 }, catalog.designFee);
check('form kosong TIDAK menyebut estimasi', !msgKosong.includes('Estimasi'), msgKosong.replace(/\n/g, ' | '));
check('form kosong tetap sebut nama produk', msgKosong.includes('Banner'));

// needDesign tercermin di pesan.
const dgnDesain = calculatePrintPrice(catalog, {
  width: 200, height: 100, quantity: 1, needDesign: true,
  selections: { [bahan.id]: bahan.choices[0].id }, productKey: 'banner',
});
const msgDesain = buildOrderMessage(banner, dgnDesain,
  { width: 200, height: 100, quantity: 1, needDesign: true }, catalog.designFee);
check('needDesign muncul di pesan', /desain/i.test(msgDesain), msgDesain.replace(/\n/g, ' | '));
check('total termasuk biaya desain', dgnDesain.total === 40000 + catalog.designFee,
  `${dgnDesain.total} vs ${40000 + catalog.designFee}`);

// Produk null tidak boleh bikin crash.
check('produk null aman', typeof buildOrderMessage(null, null, {}, 0) === 'string');

console.log(`\n${checks - failures}/${checks} pemeriksaan lolos`);
if (failures > 0) {
  console.log(`${failures} GAGAL`);
  process.exit(1);
}
console.log('SEMUA LOLOS');

// Contoh hasil untuk ditinjau manusia
const contoh = calculatePrintPrice(catalog, {
  width: 200, height: 100, quantity: 2, needDesign: true,
  selections: { [bahan.id]: bahan.choices[0].id }, productKey: 'banner',
});
console.log('\n--- contoh pesan (banner 200x100, 2 pcs, minta desain) ---');
console.log(buildOrderMessage(banner, contoh,
  { width: 200, height: 100, quantity: 2, needDesign: true }, catalog.designFee));
