// Uji tombol "Pesan lewat WhatsApp" di browser sungguhan terhadap build production.
//
//   node scripts/verify-server.mjs &   (port 4175, proxy API ke production)
//   node scripts/verify-wa-runtime.mjs
//
// Yang diuji: tombol muncul, href-nya link wa.me valid, dan isi pesan ikut berubah
// saat pelanggan mengganti ukuran/bahan - bukan sekadar teks statis.

import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = 9577;
const BASE = 'http://localhost:4175';

const chrome = spawn('google-chrome', [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${PORT}`, 'about:blank',
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
const send = (method, params = {}) => {
  id += 1;
  const i = id;
  return new Promise((r) => { pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
};
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  return r?.result?.value;
};

let failures = 0;
let checks = 0;
function check(label, ok, detail = '') {
  checks += 1;
  const status = ok ? 'OK  ' : 'FAIL';
  if (!ok) failures += 1;
  console.log(`  ${status} ${label}${!ok && detail ? ` -> ${detail}` : ''}`);
}

await send('Page.enable');
await send('Page.navigate', { url: `${BASE}/produk/banner` });
await sleep(6000);

// 1. Tombol ada
const btn = await evaluate(`(() => {
  const a = [...document.querySelectorAll('a')].find(x => /Pesan lewat WhatsApp/i.test(x.innerText));
  return a ? { href: a.getAttribute('href'), text: a.innerText.trim() } : null;
})()`);
check('tombol WhatsApp muncul di halaman produk', !!btn, 'tidak ditemukan');
if (!btn) { console.log('\nTIDAK BISA LANJUT'); ws.close(); chrome.kill(); process.exit(1); }

check('href memakai wa.me', btn.href.startsWith('https://wa.me/'), btn.href.slice(0, 50));
check('nomor tujuan benar', btn.href.includes('628156609299'), btn.href.slice(0, 60));

const pesanKosong = decodeURIComponent(btn.href.split('?text=')[1] ?? '');
check('sebut nama produk', /Banner/.test(pesanKosong), pesanKosong.slice(0, 70));
check('ukuran belum diisi -> TIDAK menyebut estimasi',
  !pesanKosong.includes('Estimasi'), pesanKosong.replace(/\n/g, ' | '));

// 2. Isi ukuran -> pesan harus ikut berubah dan memuat harga
await evaluate(`(() => {
  const set = (el, v) => {
    const proto = Object.getPrototypeOf(el);
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const inputs = [...document.querySelectorAll('input[type=number]')];
  set(inputs[0], '200');
  set(inputs[1], '100');
  return true;
})()`);
await sleep(1200);

const pesanIsi = await evaluate(`(() => {
  const a = [...document.querySelectorAll('a')].find(x => /Pesan lewat WhatsApp/i.test(x.innerText));
  return decodeURIComponent((a.getAttribute('href').split('?text=')[1] ?? ''));
})()`);

check('setelah ukuran diisi -> pesan memuat ukuran',
  pesanIsi.includes('200 x 100 cm'), pesanIsi.replace(/\n/g, ' | '));
check('setelah ukuran diisi -> pesan memuat estimasi',
  pesanIsi.includes('Estimasi'), pesanIsi.replace(/\n/g, ' | '));
check('estimasi = Rp 40.000 (200x100cm Flexy 280)',
  /Estimasi: Rp\s?40\.000/.test(pesanIsi), pesanIsi.replace(/\n/g, ' | '));
check('pesan memuat pilihan bahan',
  /Bahan:/.test(pesanIsi), pesanIsi.replace(/\n/g, ' | '));

// 3. Ganti bahan -> harga di pesan ikut berubah
const gantiBahan = await evaluate(`(() => {
  const sel = document.querySelector('select');
  if (!sel || sel.options.length < 3) return null;
  const proto = Object.getPrototypeOf(sel);
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(sel, sel.options[2].value);
  sel.dispatchEvent(new Event('change', { bubbles: true }));
  return sel.options[2].text;
})()`);
await sleep(1200);

if (gantiBahan) {
  const pesanBaru = await evaluate(`(() => {
    const a = [...document.querySelectorAll('a')].find(x => /Pesan lewat WhatsApp/i.test(x.innerText));
    return decodeURIComponent((a.getAttribute('href').split('?text=')[1] ?? ''));
  })()`);
  check(`ganti bahan -> pesan ikut berubah (${gantiBahan.slice(0, 30)})`,
    pesanBaru !== pesanIsi, 'pesan tidak berubah');
  check('harga ikut menyesuaikan bahan baru',
    !/Estimasi: Rp\s?40\.000/.test(pesanBaru), pesanBaru.replace(/\n/g, ' | '));
}

// 4. Tombol keranjang tidak hilang (tidak ada regresi)
const keranjang = await evaluate(`!![...document.querySelectorAll('button')].find(b => /Tambah ke Keranjang/i.test(b.innerText))`);
check('tombol "Tambah ke Keranjang" tetap ada', keranjang === true);

// 5. Produk non-area (pcs) juga dapat tombolnya
await send('Page.navigate', { url: `${BASE}/produk/mug` });
await sleep(5000);
const pesanMug = await evaluate(`(() => {
  const a = [...document.querySelectorAll('a')].find(x => /Pesan lewat WhatsApp/i.test(x.innerText));
  return a ? decodeURIComponent((a.getAttribute('href').split('?text=')[1] ?? '')) : null;
})()`);
check('produk satuan (mug) juga punya tombol', !!pesanMug);
if (pesanMug) {
  check('pesan mug sebut nama produk', /Mug/i.test(pesanMug), pesanMug.replace(/\n/g, ' | '));
  check('pesan mug TIDAK menyebut ukuran cm',
    !/Ukuran:.*cm/.test(pesanMug), pesanMug.replace(/\n/g, ' | '));
}

console.log(`\n${checks - failures}/${checks} pemeriksaan lolos`);
ws.close();
chrome.kill();
process.exit(failures > 0 ? 1 : 0);
