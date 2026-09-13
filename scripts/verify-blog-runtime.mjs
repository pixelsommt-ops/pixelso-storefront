// Uji runtime JSON-LD halaman BLOG di server lokal (verify-server.mjs harus jalan di :4175).
// Fokus: Article + BreadcrumbList muncul, tidak menumpuk saat pindah artikel, dan bersih
// saat keluar dari halaman artikel.
//
//   node scripts/verify-blog-runtime.mjs

import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = 9466;
const BASE = 'http://localhost:4175';

const chrome = spawn('google-chrome', [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${PORT}`, 'about:blank',
], { stdio: 'ignore' });

let failures = 0;
function check(label, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` -> ${detail}` : ''}`);
  if (!ok) failures += 1;
}

async function connect() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const res = await fetch(`http://localhost:${PORT}/json/list`);
      const page = (await res.json()).find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch { /* belum siap */ }
    await sleep(250);
  }
  throw new Error('Chrome tidak siap');
}

const ws = new WebSocket(await connect());
await new Promise((r) => { ws.onopen = r; });

let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
};
function send(method, params = {}) {
  id += 1;
  const myId = id;
  return new Promise((res) => { pending.set(myId, res); ws.send(JSON.stringify({ id: myId, method, params })); });
}
async function evaluate(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  return r?.result?.value;
}

const READ = `(() => {
  const out = {};
  for (const el of document.querySelectorAll('script[data-jsonld]')) {
    out[el.getAttribute('data-jsonld')] = JSON.parse(el.textContent);
  }
  return { out, count: document.querySelectorAll('script[data-jsonld]').length, h1: document.querySelector('h1')?.innerText ?? null };
})()`;

async function goto(path) {
  await send('Page.navigate', { url: `${BASE}${path}` });
  await sleep(3500);
}

const SLUG_A = 'tips-menghitung-untuk-packaging';
const SLUG_B = 'apa-itu-digital-printing-pengertian-cara-kerja-dan-keunggulannya';

console.log(`--- 1. /blog/${SLUG_A} ---`);
await goto(`/blog/${SLUG_A}`);
let s = await evaluate(READ);
check('ada 2 script (article + breadcrumb)', s.count === 2, String(s.count));
check('@type Article', s.out.article?.['@type'] === 'Article');
check('headline cocok H1', s.out.article?.headline === s.h1, `${s.out.article?.headline} vs ${s.h1}`);
check('datePublished terisi', Boolean(s.out.article?.datePublished));
check('TIDAK ada dateModified karangan', s.out.article?.dateModified === undefined);
check('publisher punya logo', Boolean(s.out.article?.publisher?.logo?.url));
check('breadcrumb 3 level', s.out.breadcrumb?.itemListElement?.length === 3,
  (s.out.breadcrumb?.itemListElement ?? []).map((i) => i.name).join(' > '));

console.log(`\n--- 2. Pindah ke artikel lain (uji penumpukan) ---`);
await goto(`/blog/${SLUG_B}`);
s = await evaluate(READ);
check('TETAP 2 script (tidak menumpuk)', s.count === 2, String(s.count));
check('schema ikut berganti artikel', s.out.article?.headline === s.h1, s.out.article?.headline);

console.log(`\n--- 3. Keluar ke /blog (uji cleanup) ---`);
await goto(`/blog/${SLUG_A}`);
await evaluate(`(() => {
  const l = [...document.querySelectorAll('a')].find((a) => a.getAttribute('href') === '/blog');
  if (l) { l.click(); return true; }
  window.history.pushState({}, '', '/blog');
  window.dispatchEvent(new PopStateEvent('popstate'));
  return false;
})()`);
await sleep(3000);
s = await evaluate(READ);
check('schema artikel dibersihkan', s.count === 0, `${s.count} tersisa`);

console.log(`\n--- 4. Halaman produk masih normal (tidak ada regresi) ---`);
await goto('/produk/banner');
s = await evaluate(READ);
check('produk tetap 2 script', s.count === 2, String(s.count));
check('@type Product', s.out.product?.['@type'] === 'Product');

console.log(`\n${failures === 0 ? 'SEMUA LOLOS' : `${failures} GAGAL`}`);
ws.close();
chrome.kill();
process.exit(failures === 0 ? 0 : 1);
