#!/usr/bin/env node
// Generate sitemap.xml dari data produk/blog LIVE (bukan hardcode manual) - dijalankan berkala
// via systemd timer di server (lihat deploy docs), langsung nulis ke dist/sitemap.xml supaya
// produk/artikel baru otomatis masuk tanpa perlu rebuild/redeploy frontend.
//
// Pakai: node scripts/generate-sitemap.mjs [--api-base=http://127.0.0.1:4010/api/storefront] [--out=dist/sitemap.xml]

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);

const API_BASE = args['api-base'] || 'http://127.0.0.1:4010/api/storefront';
const SITE_URL = 'https://www.cetakpixelso.com';
const OUT_PATH = args.out || new URL('../dist/sitemap.xml', import.meta.url).pathname;

const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/katalog', changefreq: 'daily', priority: '0.9' },
  { path: '/kategori', changefreq: 'weekly', priority: '0.7' },
  { path: '/promo', changefreq: 'daily', priority: '0.8' },
  { path: '/tentang-kami', changefreq: 'monthly', priority: '0.5' },
  { path: '/jam-layanan', changefreq: 'monthly', priority: '0.4' },
  { path: '/kalkulator-papercut', changefreq: 'monthly', priority: '0.6' },
  { path: '/blog', changefreq: 'weekly', priority: '0.7' },
  // /profil sengaja tidak masuk - noindex (halaman akun, lihat Profil.jsx <Seo noindex>)
];

function xmlEscape(str) {
  return String(str).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const entries = STATIC_PAGES.map((p) => urlEntry(`${SITE_URL}${p.path}`, today, p.changefreq, p.priority));

  const [catalogRes, blogRes] = await Promise.all([
    fetch(`${API_BASE}/catalog`).then((r) => r.json()),
    fetch(`${API_BASE}/blog`).then((r) => r.json()),
  ]);

  const products = catalogRes?.data?.products?.filter((p) => p.active) || [];
  for (const p of products) {
    const lastmod = (p.createdAt || today).slice(0, 10);
    entries.push(urlEntry(`${SITE_URL}/produk/${p.key}`, lastmod, 'weekly', '0.8'));
  }

  const posts = blogRes?.data || [];
  for (const post of posts) {
    const lastmod = (post.publishedAt || today).slice(0, 10);
    entries.push(urlEntry(`${SITE_URL}/blog/${post.slug}`, lastmod, 'monthly', '0.6'));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

  const fs = await import('fs/promises');
  await fs.writeFile(OUT_PATH, xml, 'utf-8');
  console.log(`Sitemap ditulis ke ${OUT_PATH} - ${products.length} produk, ${posts.length} artikel, ${STATIC_PAGES.length} halaman statis (total ${entries.length} URL).`);
}

main().catch((err) => {
  console.error('Gagal generate sitemap:', err);
  process.exit(1);
});
