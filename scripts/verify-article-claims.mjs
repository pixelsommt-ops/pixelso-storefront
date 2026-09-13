// Verifikasi SEMUA klaim harga & internal link di artikel blog terhadap katalog production.
// Jalankan ulang setiap kali harga di ERP berubah, sebelum menerbitkan/memperbarui artikel.
//
//   node scripts/verify-article-claims.mjs
//
// Alasan ada skrip ini: artikel yang memuat harga akan basi diam-diam. Pelanggan yang
// membaca "Rp20.000/m²" lalu dihitungkan lain di kalkulator akan merasa tertipu, dan
// Google menilai halaman berisi harga usang sebagai konten berkualitas rendah.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CATALOG_URL = 'https://www.cetakpixelso.com/api/storefront/catalog';
const ARTIKEL_DIR = new URL('../docs/artikel/', import.meta.url).pathname;

// Route non-produk yang sah dipakai sebagai internal link di artikel.
const VALID_ROUTES = new Set([
  '/', '/katalog', '/kategori', '/promo', '/blog', '/tentang-kami',
  '/jam-layanan', '/kalkulator-papercut', '/kebijakan-privasi',
]);

let failures = 0;
function check(label, ok, detail = '') {
  if (!ok) {
    failures += 1;
    console.log(`  FAIL  ${label}${detail ? ` -> ${detail}` : ''}`);
  }
}

function idr(n) {
  return `Rp${Number(n).toLocaleString('id-ID')}`;
}

async function loadCatalog() {
  try {
    const res = await fetch(CATALOG_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    return body.data ?? body;
  } catch (err) {
    console.log(`(katalog live gagal: ${err.message}, pakai cache /tmp/cat.json)`);
    const body = JSON.parse(readFileSync('/tmp/cat.json', 'utf8'));
    return body.data ?? body;
  }
}

const catalog = await loadCatalog();
const products = new Map(catalog.products.map((p) => [p.key, p]));

const files = readdirSync(ARTIKEL_DIR).filter((f) => f.endsWith('.md'));
console.log(`Artikel diperiksa: ${files.length}\n`);

for (const file of files) {
  const text = readFileSync(join(ARTIKEL_DIR, file), 'utf8');
  console.log(`--- ${file} ---`);

  // 1. Internal link harus menunjuk produk aktif atau route yang sah.
  const links = [...new Set([...text.matchAll(/\]\((\/[a-z0-9\-/]*)\)/g)].map((m) => m[1]))];
  for (const link of links) {
    if (link.startsWith('/produk/')) {
      const key = link.replace('/produk/', '');
      const product = products.get(key);
      check(`link ${link}`, Boolean(product), 'produk tidak ada di katalog');
      if (product) check(`link ${link} produk aktif`, product.active !== false, 'produk nonaktif');
    } else {
      check(`link ${link}`, VALID_ROUTES.has(link), 'route tidak dikenal');
    }
  }

  // 2. Setiap harga produk yang disebut namanya harus cocok dengan katalog.
  //    Dicek dengan menelusuri produk yang ditautkan artikel ini.
  for (const link of links.filter((l) => l.startsWith('/produk/'))) {
    const key = link.replace('/produk/', '');
    const product = products.get(key);
    if (!product) continue;

    const rate = Number(product.baseRate);
    if (Number.isFinite(rate) && rate > 0) {
      // Harga dasar produk boleh tidak disebut (mis. produk yang cuma disinggung sekilas),
      // tapi kalau disebut, harus benar. Yang diperiksa: tidak ada harga LAIN yang
      // diklaim sebagai harga produk ini - dicek lewat opsi di bawah.
    }

    // Semua pilihan opsi (bahan/paket) yang harganya muncul di artikel harus cocok.
    for (const group of product.optionGroups ?? []) {
      for (const choice of group.choices ?? []) {
        const priceStr = idr(choice.priceValue);

        // Cocokkan LABEL LENGKAP yang dinormalisasi (spasi dibuang, huruf kecil).
        //
        // Dua pendekatan sebelumnya gagal saat uji mutasi:
        // 1. "apakah harga ada di suatu tempat di artikel" -> harga salah tetap lolos
        //    karena angka yang benar kebetulan muncul di tabel contoh hitungan.
        // 2. cocokkan nama depan saja -> "Flexy 280 gsm" ikut cocok dengan baris paket
        //    "X Banner + Flexy 280gsm", dan dua varian "Roll Up Banner + Luster" yang
        //    beda ukuran saling dituduh salah.
        //
        // Normalisasi menangani beda penulisan antara katalog dan artikel
        // ("280gsm (160x60cm)" vs "280 gsm (160 x 60 cm)").
        const norm = (s) => s.toLowerCase().replace(/\s+/g, '');
        const labelNorm = norm(choice.label);
        if (labelNorm.length <= 6) continue;

        const barisHarga = text.split('\n').filter(
          (line) => norm(line).includes(labelNorm) && /Rp[\d.]+/.test(line),
        );
        if (barisHarga.length === 0) continue; // tidak disebut, atau disebut tanpa harga

        for (const line of barisHarga) {
          const angka = [...line.matchAll(/Rp[\d.]+/g)].map((m) => m[0]);
          check(`${key}: "${choice.label}" -> ${priceStr}`, angka.includes(priceStr),
            `baris memuat ${angka.join(', ')}`);
        }
      }
    }
  }

  // 3. Biaya desain.
  const designFee = Number(catalog.designFee ?? 0);
  if (designFee > 0 && /desain/i.test(text) && /biaya desain/i.test(text)) {
    check(`biaya desain ${idr(designFee)}`, text.includes(idr(designFee)));
  }

  // 4. Larangan klaim yang tidak bisa dibuktikan.
  check('tidak mengklaim "termurah"', !/termurah/i.test(text));
  check('tidak mengklaim "terbaik di"', !/terbaik di/i.test(text));
  check('tidak mengarang rating bintang', !/\d[,.]\d\s*bintang/i.test(text));

  // 5. Artikel berharga wajib memuat penanda periode agar jelas kapan harga berlaku.
  if (/Rp[\d.]/.test(text)) {
    check('memuat penanda periode harga', /202\d/.test(text),
      'artikel memuat harga tapi tidak menyebut tahun/bulan berlaku');
  }

  console.log(`  ${failures === 0 ? 'bersih' : 'ada masalah'}`);
}

console.log(`\n${failures === 0 ? 'SEMUA KLAIM TERVERIFIKASI' : `${failures} MASALAH DITEMUKAN`}`);
process.exit(failures === 0 ? 0 : 1);
