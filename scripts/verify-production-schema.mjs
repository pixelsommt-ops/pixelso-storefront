// Verifikasi JSON-LD pada PRODUCTION (bukan lokal), memakai user-agent Googlebot -
// meniru persis apa yang dilihat crawler Google setelah merender JavaScript.
//
//   node scripts/verify-production-schema.mjs

import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = 9444;
const BASE = 'https://www.cetakpixelso.com';
const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const chrome = spawn('google-chrome', [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${PORT}`, `--user-agent=${UA}`, 'about:blank',
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
  const store = [...document.querySelectorAll('script[type="application/ld+json"]:not([data-jsonld])')]
    .map((e) => JSON.parse(e.textContent)['@type']);
  return { out, store, h1: document.querySelector('h1')?.innerText ?? null, title: document.title };
})()`;

for (const key of ['banner', 'mug', 'kartu-nama']) {
  console.log(`\n--- ${BASE}/produk/${key} ---`);
  await send('Page.navigate', { url: `${BASE}/produk/${key}` });
  await sleep(5000);
  const s = await evaluate(READ);

  check('Product schema ada', Boolean(s.out.product));
  check('Breadcrumb schema ada', Boolean(s.out.breadcrumb));
  if (s.out.product) {
    const p = s.out.product;
    check('@type Product', p['@type'] === 'Product', p['@type']);
    check('name cocok dengan H1', p.name === s.h1, `${p.name} vs ${s.h1}`);
    check('url produk benar', p.url === `${BASE}/produk/${key}`, p.url);
    check('TIDAK ada aggregateRating', !('aggregateRating' in p));
    check('offers IDR + lowPrice', p.offers?.priceCurrency === 'IDR' && p.offers?.lowPrice > 0,
      `${p.offers?.priceCurrency} ${p.offers?.lowPrice}`);
    check('semua image absolut', (p.image ?? []).every((u) => u.startsWith('https://')));
  }
  if (s.out.breadcrumb) {
    const names = s.out.breadcrumb.itemListElement.map((i) => i.name);
    check('breadcrumb mulai Beranda', names[0] === 'Beranda', names.join(' > '));
    check('breadcrumb berakhir di produk', names[names.length - 1] === s.h1);
  }
  check('schema Store homepage tetap ada', s.store.includes('Store'), s.store.join(','));
}

console.log(`\n${failures === 0 ? 'SEMUA LOLOS DI PRODUCTION' : `${failures} GAGAL`}`);
ws.close();
chrome.kill();
process.exit(failures === 0 ? 0 : 1);
