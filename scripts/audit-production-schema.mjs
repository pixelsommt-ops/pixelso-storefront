// Audit seluruh JSON-LD yang benar-benar ter-render di production, dilihat sebagai Googlebot.
// Dipakai untuk menemukan celah structured data (halaman mana yang belum punya schema apa).
//
//   node scripts/audit-production-schema.mjs

import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = 9455;
const BASE = 'https://www.cetakpixelso.com';
const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const chrome = spawn('google-chrome', [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${PORT}`, `--user-agent=${UA}`, 'about:blank',
], { stdio: 'ignore' });

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

// Catat SEMUA ld+json beserta lokasinya (head vs body) - lokasi penting karena
// script di dalam komponen React ikut ter-unmount saat pindah halaman.
const READ = `(() => {
  const list = [...document.querySelectorAll('script[type="application/ld+json"]')].map((el) => {
    let type = '?';
    try { type = JSON.parse(el.textContent)['@type'] ?? '?'; } catch { type = 'PARSE_ERROR'; }
    return { type, where: el.closest('head') ? 'head' : 'body', tag: el.getAttribute('data-jsonld') };
  });
  return { list, title: document.title, h1: document.querySelector('h1')?.innerText ?? null };
})()`;

const pages = [
  '/', '/katalog', '/kategori', '/blog',
  '/blog/tips-menghitung-untuk-packaging',
  '/blog/apa-itu-digital-printing-pengertian-cara-kerja-dan-keunggulannya',
  '/produk/banner', '/tentang-kami', '/jam-layanan', '/kalkulator-papercut',
];

for (const path of pages) {
  await send('Page.navigate', { url: `${BASE}${path}` });
  await sleep(4500);
  const s = await evaluate(READ);
  const types = s.list.map((x) => `${x.type}(${x.where})`).join(', ') || '— TIDAK ADA —';
  console.log(`${path.padEnd(62)} ${types}`);
}

ws.close();
chrome.kill();
