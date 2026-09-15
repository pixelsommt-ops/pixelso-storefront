#!/usr/bin/env node
/**
 * Cek apakah hasil prerender di production sudah basi (drift).
 *
 * MASALAH YANG DIPANTAU
 * ---------------------
 * Prerender itu snapshot saat build. Sitemap production diperbarui tiap 6 jam
 * dari data LIVE. Jadi begitu ada produk/artikel BARU terbit, URL-nya sudah
 * masuk sitemap (dan diberikan ke Google) padahal belum pernah diprerender.
 *
 * URL yang belum diprerender akan disajikan lewat fallback SPA `dist/index.html`,
 * yang berarti kembali ke kondisi rusak:
 *   - canonical menunjuk ke homepage
 *   - <body> kosong untuk crawler
 *   - title generik "Pixelso Gemolong - Pesan Cetak Online"
 *
 * Tidak ada error, tidak ada peringatan. Halaman baru diam-diam tidak bisa ranking.
 * Script ini yang membuat kondisi itu terlihat.
 *
 * PEMAKAIAN
 *   node scripts/check-prerender-drift.mjs
 *
 * Keluar dengan kode 1 kalau ada halaman yang perlu diprerender ulang,
 * jadi bisa dipakai di cron / CI.
 *
 * CARA MEMPERBAIKI kalau ada drift:
 *   npm run build:seo   lalu deploy (lihat docs/DEPLOY.md)
 */

const SITE = 'https://www.cetakpixelso.com';
const GBOT =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

// Ambang: halaman yang benar-benar diprerender jauh lebih besar dari shell SPA
// (~8.7 KB). Halaman prerender terkecil yang teramati ~35 KB.
const SHELL_MAX_BYTES = 12000;

async function fetchAsBot(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': GBOT },
    signal: AbortSignal.timeout(25000),
  });
  return { status: res.status, html: await res.text() };
}

function canonicalOf(html) {
  const m =
    html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) ||
    html.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i);
  return m ? m[1] : '';
}

async function main() {
  console.log('Mengambil sitemap production...');
  const smRes = await fetch(`${SITE}/sitemap.xml`, {
    signal: AbortSignal.timeout(25000),
  });
  if (!smRes.ok) throw new Error(`sitemap HTTP ${smRes.status}`);
  const xml = await smRes.text();

  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  console.log(`URL di sitemap: ${urls.length}\n`);

  const stale = [];
  const ok = [];

  for (const url of urls) {
    const pathname = new URL(url).pathname.replace(/\/$/, '') || '/';

    // Homepage memang sengaja tidak diprerender - index.html statis sudah
    // ditulis khusus untuk homepage (canonical "/" & title-nya sudah benar).
    if (pathname === '/') {
      ok.push({ pathname, note: 'homepage (sengaja tidak diprerender)' });
      continue;
    }

    let info;
    try {
      info = await fetchAsBot(url);
    } catch (err) {
      stale.push({ pathname, reason: `gagal diambil: ${err.message}` });
      continue;
    }

    if (info.status !== 200) {
      stale.push({ pathname, reason: `HTTP ${info.status}` });
      continue;
    }

    const bytes = Buffer.byteLength(info.html);
    const canon = canonicalOf(info.html);
    const canonPath = canon ? new URL(canon).pathname.replace(/\/$/, '') : '';

    if (bytes <= SHELL_MAX_BYTES) {
      stale.push({
        pathname,
        reason: `belum diprerender (${bytes}b = shell SPA, canonical -> ${canonPath || 'none'})`,
      });
    } else if (canonPath !== pathname) {
      stale.push({
        pathname,
        reason: `canonical salah -> ${canon || 'none'}`,
      });
    } else {
      ok.push({ pathname, bytes });
    }
  }

  console.log('=== HASIL ===');
  console.log(`  sehat : ${ok.length}`);
  console.log(`  basi  : ${stale.length}`);

  if (stale.length) {
    console.log('\n  Halaman yang PERLU diprerender ulang:');
    for (const s of stale) console.log(`    ${s.pathname}\n      ${s.reason}`);
    console.log('\n  PERBAIKAN: npm run build:seo, lalu deploy (docs/DEPLOY.md)');
    process.exitCode = 1;
  } else {
    console.log('\n  Semua halaman di sitemap sudah diprerender dengan benar.');
  }
}

main().catch((err) => {
  console.error('GAGAL:', err.message);
  process.exit(2);
});
