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
  // Landing page layanan berintensi beli (SEO lokal Sragen/Gemolong).
  { path: '/sablon-kaos-custom', changefreq: 'monthly', priority: '0.8' },
  { path: '/jersey-custom', changefreq: 'monthly', priority: '0.8' },
  { path: '/cetak-undangan', changefreq: 'monthly', priority: '0.8' },
  { path: '/cetak-kemasan', changefreq: 'monthly', priority: '0.8' },
  { path: '/neonbox-reklame', changefreq: 'monthly', priority: '0.8' },
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

  const [catalogRes, blogRes, portfolioRes] = await Promise.all([
    fetch(`${API_BASE}/catalog`).then((r) => r.json()),
    fetch(`${API_BASE}/blog`).then((r) => r.json()),
    // Portofolio (2026-09-26): dulu data statis di src/data/portfolio.js, sekarang dari ERP
    // (lihat HANDOFF-PORTFOLIO.md Tahap B). Kegagalan fetch ditandai `failed:true` (BUKAN
    // { data: [] }) supaya dibedakan dari "memang belum ada portofolio published" - kalau
    // disamakan, gangguan sesaat pada endpoint portfolio akan menghapus SEMUA URL portofolio
    // dari sitemap sampai timer berikutnya sukses, walau datanya di ERP baik-baik saja.
    fetch(`${API_BASE}/portfolio`).then((r) => r.json()).catch((err) => ({ failed: true, error: err.message })),
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

  // PENTING - /portfolio hanya masuk sitemap kalau isinya TIDAK kosong. Halaman daftar yang
  // cuma berisi "Segera Hadir" adalah halaman tipis; menyerahkannya ke Google justru sinyal
  // buruk. Begitu ada entri published pertama di ERP, URL-nya otomatis ikut.
  //
  // Kalau fetch-nya sendiri GAGAL (timeout/500/dsb), JANGAN hapus URL portofolio yang sudah
  // ada - pertahankan dari sitemap lama supaya satu gangguan sesaat tidak membuat Google
  // kehilangan seluruh halaman portofolio yang sudah terindeks.
  if (portfolioRes?.failed) {
    console.warn(`Lewati portofolio (fetch gagal, sitemap lama dipertahankan): ${portfolioRes.error}`);
    try {
      const fs = await import('fs/promises');
      const oldXml = await fs.readFile(OUT_PATH, 'utf8');
      const oldPortfolioUrls = [...oldXml.matchAll(/<url>\s*<loc>([^<]*\/portfolio[^<]*)<\/loc>[\s\S]*?<\/url>/g)];
      for (const m of oldPortfolioUrls) entries.push(m[0].trim());
      console.warn(`  -> ${oldPortfolioUrls.length} URL portofolio lama dipertahankan.`);
    } catch {
      // Belum ada sitemap lama (mis. build pertama) - tidak ada yang bisa dipertahankan.
    }
  } else {
    const portfolioItems = portfolioRes?.data || [];
    if (portfolioItems.length > 0) {
      entries.push(urlEntry(`${SITE_URL}/portfolio`, today, 'weekly', '0.8'));
      for (const item of portfolioItems) {
        if (!item?.slug) continue;
        const lastmod = (item.publishedAt || today).slice(0, 10);
        entries.push(urlEntry(`${SITE_URL}/portfolio/${item.slug}`, lastmod, 'monthly', '0.7'));
      }
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

  const fs = await import('fs/promises');
  await fs.writeFile(OUT_PATH, xml, 'utf-8');
  const portfolioCount = portfolioRes?.failed ? '?' : (portfolioRes?.data || []).length;
  console.log(`Sitemap ditulis ke ${OUT_PATH} - ${products.length} produk, ${posts.length} artikel, ${portfolioCount} portofolio, ${STATIC_PAGES.length} halaman statis (total ${entries.length} URL).`);
}

main().catch((err) => {
  console.error('Gagal generate sitemap:', err);
  process.exit(1);
});
