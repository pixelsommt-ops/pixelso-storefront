// Server verifikasi lokal: serve hasil build dist/ SEKALIGUS proxy /api/storefront ke production,
// sehingga halaman dibuka dari satu origin yang sama (tidak kena CORS) dan React bisa fetch
// katalog asli. Dipakai hanya untuk memverifikasi JSON-LD ter-render; bukan bagian dari app.
//
//   node scripts/verify-server.mjs
//   google-chrome --headless=new --dump-dom http://localhost:4175/produk/banner

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const PORT = 4175;
const UPSTREAM = 'https://www.cetakpixelso.com';

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webp': 'image/webp', '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Proxy API & uploads ke production - origin di browser tetap localhost, jadi tidak ada CORS.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')) {
    try {
      const upstream = await fetch(`${UPSTREAM}${url.pathname}${url.search}`);
      const body = Buffer.from(await upstream.arrayBuffer());
      res.writeHead(upstream.status, {
        'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
      });
      res.end(body);
    } catch (err) {
      res.writeHead(502).end(String(err));
    }
    return;
  }

  // Static file, fallback ke index.html (SPA routing).
  let filePath = join(DIST, url.pathname);
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    const html = await readFile(join(DIST, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
}).listen(PORT, () => console.log(`verify-server siap di http://localhost:${PORT}`));
