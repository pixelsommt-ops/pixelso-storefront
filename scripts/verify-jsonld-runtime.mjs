// Uji perilaku runtime JSON-LD lewat Chrome DevTools Protocol (tanpa dependency tambahan):
//  1. schema ter-render dengan isi yang benar,
//  2. navigasi client-side antar produk MENGGANTI schema, bukan menumpuk,
//  3. pindah ke halaman non-produk MEMBERSIHKAN schema.
//
// Butuh verify-server.mjs jalan di :4175.
//   node scripts/verify-jsonld-runtime.mjs

import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = 9333;
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
      const targets = await res.json();
      const page = targets.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch { /* belum siap */ }
    await sleep(250);
  }
  throw new Error('Chrome tidak siap');
}

const wsUrl = await connect();
const ws = new WebSocket(wsUrl);
await new Promise((resolve) => { ws.onopen = resolve; });

let msgId = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result);
    pending.delete(msg.id);
  }
};

function send(method, params = {}) {
  msgId += 1;
  const id = msgId;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {
    expression, returnByValue: true, awaitPromise: true,
  });
  return result?.result?.value;
}

// Baca semua JSON-LD milik komponen (yang punya data-jsonld) + total script ld+json di halaman.
const READ = `(() => {
  const tagged = [...document.querySelectorAll('script[data-jsonld]')].map((e) => ({
    tag: e.getAttribute('data-jsonld'),
    type: JSON.parse(e.textContent)['@type'],
    name: JSON.parse(e.textContent).name ?? null,
    lowPrice: JSON.parse(e.textContent).offers?.lowPrice ?? null,
    hasRating: 'aggregateRating' in JSON.parse(e.textContent),
    crumbs: (JSON.parse(e.textContent).itemListElement ?? []).map((i) => i.name),
  }));
  return { tagged, totalLdJson: document.querySelectorAll('script[type="application/ld+json"]').length, h1: document.querySelector('h1')?.innerText ?? null };
})()`;

async function goto(path) {
  await send('Page.navigate', { url: `${BASE}${path}` });
  await sleep(3500);
}

// Navigasi client-side (tanpa reload) - inilah yang memicu remount komponen JsonLd.
async function clickLink(path) {
  await evaluate(`(() => {
    const link = [...document.querySelectorAll('a')].find((a) => a.getAttribute('href') === '${path}');
    if (link) { link.click(); return true; }
    window.history.pushState({}, '', '${path}');
    window.dispatchEvent(new PopStateEvent('popstate'));
    return false;
  })()`);
  await sleep(3000);
}

console.log('--- 1. Muat /produk/banner ---');
await goto('/produk/banner');
let state = await evaluate(READ);
check('ada 2 script ber-tag (product + breadcrumb)', state.tagged.length === 2, `${state.tagged.length}`);
check('H1 = Banner / MMT Outdoor', state.h1 === 'Banner / MMT Outdoor', state.h1);
const product = state.tagged.find((t) => t.tag === 'product');
const crumb = state.tagged.find((t) => t.tag === 'breadcrumb');
check('Product name benar', product?.name === 'Banner / MMT Outdoor', product?.name);
check('lowPrice 20000', product?.lowPrice === 20000, String(product?.lowPrice));
check('TIDAK ada aggregateRating', product?.hasRating === false);
check('breadcrumb 4 level', crumb?.crumbs.length === 4, JSON.stringify(crumb?.crumbs));

console.log('\n--- 2. Navigasi client-side ke /produk/mug (uji penumpukan) ---');
await goto('/produk/mug');
state = await evaluate(READ);
check('TETAP 2 script ber-tag (tidak menumpuk)', state.tagged.length === 2, `${state.tagged.length}`);
const mug = state.tagged.find((t) => t.tag === 'product');
check('schema ter-update ke Mug', mug?.name?.includes('Mug'), mug?.name);
check('harga ter-update (20000 utk mug)', mug?.lowPrice === 20000, String(mug?.lowPrice));

console.log('\n--- 3. SPA navigate antar produk via pushState ---');
await goto('/produk/banner');
await clickLink('/produk/kartu-nama');
state = await evaluate(READ);
check('setelah SPA-nav tetap 2 script', state.tagged.length === 2, `${state.tagged.length}`);
const kartu = state.tagged.find((t) => t.tag === 'product');
check('schema ikut berganti produk', kartu?.name !== 'Banner / MMT Outdoor', kartu?.name);

console.log('\n--- 4. Pindah ke halaman non-produk (uji cleanup) ---');
await goto('/produk/banner');
await clickLink('/katalog');
state = await evaluate(READ);
check('schema produk dibersihkan di /katalog', state.tagged.length === 0, `${state.tagged.length} tersisa`);
check('schema Store dari index.html tetap ada', state.totalLdJson >= 1, `${state.totalLdJson}`);

console.log(`\n${failures === 0 ? 'SEMUA LOLOS' : `${failures} GAGAL`}`);
ws.close();
chrome.kill();
process.exit(failures === 0 ? 0 : 1);
