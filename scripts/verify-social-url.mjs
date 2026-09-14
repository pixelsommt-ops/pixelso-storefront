// Verifikasi facebookUrl() menangani semua bentuk isi field dari ERP.
//
//   node scripts/verify-social-url.mjs
//
// Kasus terpenting: field di production pernah berisi NAMA HALAMAN ("Pixelso Gemolong"),
// bukan username. Kalau itu dirender apa adanya, tautannya menuju halaman error.

import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';

const src = readFileSync(new URL('../src/lib/socialUrl.js', import.meta.url), 'utf8');
const tmp = new URL('../src/lib/__socialUrl.verify.js', import.meta.url);
writeFileSync(tmp, src);
let facebookUrl;
try {
  ({ facebookUrl } = await import(tmp.href));
} finally {
  unlinkSync(tmp);
}

let failures = 0;
let checks = 0;
function check(label, aktual, harap) {
  checks += 1;
  const ok = aktual === harap;
  if (!ok) {
    failures += 1;
    console.log(`  FAIL  ${label}\n        harap : ${harap}\n        aktual: ${aktual}`);
  }
}

const FB = 'https://www.facebook.com/cetakPixelso';

// --- Yang HARUS jadi tautan ---
check('username polos', facebookUrl('cetakPixelso'), FB);
check('username dengan @', facebookUrl('@cetakPixelso'), FB);
check('ada spasi di pinggir', facebookUrl('  cetakPixelso  '), FB);
check('URL penuh https', facebookUrl('https://www.facebook.com/cetakPixelso'), FB);
check('URL tanpa www', facebookUrl('https://facebook.com/cetakPixelso'),
  'https://facebook.com/cetakPixelso');
check('domain tanpa protokol', facebookUrl('facebook.com/cetakPixelso'), FB);
check('www tanpa protokol', facebookUrl('www.facebook.com/cetakPixelso'), FB);
check('trailing slash', facebookUrl('facebook.com/cetakPixelso/'), FB);
check('username pakai titik', facebookUrl('pixelso.gemolong'),
  'https://www.facebook.com/pixelso.gemolong');

// --- Yang HARUS ditolak (lebih baik tidak muncul daripada tautan rusak) ---
check('NAMA HALAMAN (nilai production)', facebookUrl('Pixelso Gemolong'), null);
check('nama panjang berspasi', facebookUrl('Pixelso Digital Print & Creative Studio'), null);
check('string kosong', facebookUrl(''), null);
check('spasi saja', facebookUrl('   '), null);
check('null', facebookUrl(null), null);
check('undefined', facebookUrl(undefined), null);
check('terlalu pendek', facebookUrl('abc'), null);
check('domain lain', facebookUrl('https://instagram.com/cetakpixelso'), null);
check('URL acak', facebookUrl('https://contoh.com/halaman'), null);

console.log(`${checks - failures}/${checks} pemeriksaan lolos`);

// --- Cek nilai ASLI yang sedang dipakai production (opsional - VPS pakai rate limit,
// kegagalan jaringan tidak boleh menggagalkan verifikasi logika di atas) ---
try {
  const res = await fetch('https://www.cetakpixelso.com/api/storefront/settings');
  const body = await res.json();
  const nilai = (body.data ?? body).facebook;
  const hasil = facebookUrl(nilai);
  console.log(`\nNilai facebook di ERP production: ${JSON.stringify(nilai)}`);
  console.log(`Hasil facebookUrl()             : ${hasil}`);
  if (hasil === null) {
    console.log('\n-> Tautan Facebook TIDAK akan muncul di footer sampai field di ERP');
    console.log('   diganti jadi username: cetakPixelso');
  }
} catch (err) {
  console.log(`\n(lewati cek production: ${err.cause?.code || err.message})`);
}

if (failures > 0) {
  console.log(`\n${failures} GAGAL`);
  process.exit(1);
}
console.log('\nSEMUA LOLOS');
