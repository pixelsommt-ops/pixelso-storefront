#!/usr/bin/env node
/**
 * Prerender storefront routes into static HTML.
 *
 * MASALAH YANG DISELESAIKAN
 * -------------------------
 * Storefront ini SPA client-side murni. HTML yang dikirim ke crawler:
 *   - <body> kosong  -> Google tidak melihat H1, harga, teks, internal link
 *   - canonical statis dari index.html -> SEMUA route mengaku duplikat homepage
 *
 * Seo.jsx sudah memperbaiki canonical, tapi baru SETELAH JavaScript jalan.
 * Sinyal pertama yang dibaca Google tetap salah, dan Google sering
 * mempertahankan sinyal pertama.
 *
 * Script ini menjalankan Chrome sungguhan untuk tiap route, menunggu React
 * selesai render, lalu menyimpan HTML hasilnya sebagai file statis di dist/.
 * Nginx `try_files $uri ...` akan menyajikan file itu lebih dulu, jadi crawler
 * langsung dapat HTML terisi dengan canonical + JSON-LD yang benar.
 * Pengguna biasa tetap dapat SPA penuh (React hydrate di atas HTML itu).
 *
 * PEMAKAIAN
 *   npm run build && node scripts/prerender.mjs
 *
 * Rute diambil dari dist/sitemap.xml (sumber kebenaran yang sama dengan Google).
 */

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = 5199;

// Chrome sistem - sengaja tidak memakai paket `puppeteer` penuh supaya tidak
// mengunduh ~200MB Chromium terpisah.
const CHROME_CANDIDATES = [
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/opt/google/chrome/chrome',
];

// Halaman privat/transaksional: tidak pernah diprerender (sudah Disallow di
// robots.txt, dan isinya bergantung sesi login).
const SKIP = [
  '/keranjang', '/checkout', '/pesanan', '/login', '/daftar',
  '/lupa-password', '/reset-password', '/profil',
];

// PENTING - kenapa "/" sengaja TIDAK diprerender.
//
// `dist/index.html` punya dua peran sekaligus di nginx:
//   1. halaman untuk "/"                     (index index.html)
//   2. fallback SPA untuk semua rute lain    (try_files ... /index.html)
//
// Kalau file itu diisi hasil render homepage, maka rute yang tidak diprerender
// (keranjang, checkout, login, profil) akan menyajikan HTML homepage dulu lalu
// React menimpanya - pengguna melihat kedipan isi homepage. Itu regresi.
//
// Homepage juga yang paling sedikit diuntungkan: tag statis di index.html
// (title, description, canonical "/") memang ditulis untuk homepage, jadi
// satu-satunya halaman yang canonical-nya sudah benar sejak awal.
//
// Kalau nanti homepage ingin ikut diprerender, nginx perlu fallback ke file
// shell terpisah (mis. /app-shell.html) - itu perubahan konfigurasi produksi
// dan harus disetujui pemilik lebih dulu.
const SKIP_EXACT = ['/'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

function findChrome() {
  for (const p of CHROME_CANDIDATES) if (existsSync(p)) return p;
  throw new Error(
    'Chrome/Chromium tidak ditemukan. Pasang google-chrome atau chromium, ' +
    'atau tambahkan path-nya ke CHROME_CANDIDATES.'
  );
}

/**
 * Server statis untuk dist/ dengan fallback SPA ke index.html.
 * API di-proxy ke production supaya halaman produk/blog terisi data asli.
 */
function startServer() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    let pathname = decodeURIComponent(url.pathname);

    // Proxy panggilan data ke production.
    if (pathname.startsWith('/api/') || pathname.startsWith('/uploads/')) {
      try {
        const upstream = await fetch(`https://www.cetakpixelso.com${pathname}${url.search}`, {
          headers: { accept: req.headers.accept || '*/*' },
        });
        const buf = Buffer.from(await upstream.arrayBuffer());
        res.writeHead(upstream.status, {
          'content-type': upstream.headers.get('content-type') || 'application/octet-stream',
        });
        return res.end(buf);
      } catch {
        res.writeHead(502).end('{}');
        return;
      }
    }

    let filePath = path.join(DIST, pathname);
    try {
      await access(filePath);
      if ((await import('node:fs')).statSync(filePath).isDirectory()) throw new Error('dir');
    } catch {
      filePath = path.join(DIST, 'index.html'); // fallback SPA
    }

    try {
      const body = await readFile(filePath);
      res.writeHead(200, { 'content-type': MIME[path.extname(filePath)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });

  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

/**
 * Rute diambil dari sitemap PRODUCTION (sumber kebenaran yang sama dengan Google),
 * dengan fallback ke dist/sitemap.xml lokal kalau jaringan tidak tersedia.
 *
 * Kenapa production dan bukan lokal: sitemap production dihasilkan ulang tiap 6 jam
 * dari data produk/artikel LIVE oleh systemd timer. `dist/sitemap.xml` hasil build
 * hanyalah salinan `public/sitemap.xml` di repo yang mudah basi - memakainya berarti
 * produk/artikel baru tidak ikut diprerender tanpa peringatan apa pun.
 */
async function getRoutes() {
  let xml = null;
  let source = '';

  try {
    const res = await fetch('https://www.cetakpixelso.com/sitemap.xml', {
      signal: AbortSignal.timeout(20000),
    });
    if (res.ok) {
      xml = await res.text();
      source = 'production';
    }
  } catch {
    // jatuh ke fallback di bawah
  }

  if (!xml) {
    xml = await readFile(path.join(DIST, 'sitemap.xml'), 'utf8');
    source = 'dist/sitemap.xml (LOKAL - bisa basi)';
  }

  const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  const routes = locs
    .map((u) => {
      try { return new URL(u).pathname; } catch { return null; }
    })
    .filter(Boolean)
    .map((p) => (p.length > 1 ? p.replace(/\/$/, '') : p))
    .filter((p) => !SKIP_EXACT.includes(p))
    .filter((p) => !SKIP.some((s) => p === s || p.startsWith(`${s}/`)));

  return { routes: [...new Set(routes)], source };
}

async function main() {
  if (!existsSync(DIST)) throw new Error('dist/ belum ada. Jalankan `npm run build` dulu.');

  const chrome = findChrome();
  console.log(`Chrome    : ${chrome}`);

  const { routes, source } = await getRoutes();
  console.log(`Sumber    : ${source}`);
  console.log(`Rute      : ${routes.length}\n`);

  const server = await startServer();
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  const results = [];
  try {
    for (const route of routes) {
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/122.0.0.0 Safari/537.36 PixelsoPrerender'
      );
      let status = 'ok';
      try {
        await page.goto(`http://localhost:${PORT}${route}`, {
          waitUntil: 'networkidle0',
          timeout: 45000,
        });
        // Tunggu React benar-benar menaruh isi di #root.
        await page.waitForFunction(
          () => (document.querySelector('#root')?.innerText || '').trim().length > 50,
          { timeout: 20000 }
        ).catch(() => { status = 'thin'; });

        const html = await page.content();
        const info = await page.evaluate(() => ({
          canonical: document.querySelector('link[rel=canonical]')?.href || '',
          title: document.title,
          chars: (document.body.innerText || '').length,
          types: [...document.querySelectorAll('script[type="application/ld+json"]')]
            .flatMap((s) => {
              try {
                const j = JSON.parse(s.textContent);
                return Array.isArray(j) ? j.map((x) => x['@type']) : [j['@type']];
              } catch { return []; }
            })
            .filter(Boolean),
        }));

        // Tulis sebagai <route>/index.html supaya nginx try_files menemukannya.
        const outDir = route === '/' ? DIST : path.join(DIST, route);
        await mkdir(outDir, { recursive: true });
        await writeFile(path.join(outDir, 'index.html'), html, 'utf8');

        results.push({ route, status, ...info });
        console.log(
          `  ${status === 'ok' ? 'OK  ' : 'THIN'} ${route.padEnd(52)} ` +
          `${String(info.chars).padStart(6)}ch  [${info.types.join(',') || 'no-jsonld'}]`
        );
      } catch (err) {
        results.push({ route, status: 'FAIL', error: err.message });
        console.log(`  FAIL ${route.padEnd(52)} ${err.message.slice(0, 60)}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  // ---- Ringkasan & gerbang mutu ----
  const fail = results.filter((r) => r.status === 'FAIL');
  const thin = results.filter((r) => r.status === 'thin');
  const badCanonical = results.filter(
    (r) => r.canonical && r.route !== '/' && new URL(r.canonical).pathname.replace(/\/$/, '') !== r.route
  );

  console.log('\n=== RINGKASAN ===');
  console.log(`  total       : ${results.length}`);
  console.log(`  berhasil    : ${results.length - fail.length - thin.length}`);
  console.log(`  tipis       : ${thin.length}`);
  console.log(`  gagal       : ${fail.length}`);
  console.log(`  canonical salah: ${badCanonical.length}`);

  if (badCanonical.length) {
    console.log('\n  Canonical tidak cocok dengan route:');
    for (const r of badCanonical) console.log(`    ${r.route} -> ${r.canonical}`);
  }
  if (fail.length) {
    console.log('\n  Gagal:');
    for (const r of fail) console.log(`    ${r.route}: ${r.error}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('PRERENDER GAGAL:', err.message);
  process.exit(1);
});
