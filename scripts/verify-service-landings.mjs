#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LANDING_PAGES } from '../src/data/serviceLandingPages.js';
import { buildServiceLandingBreadcrumb, buildServiceLandingFaqSchema, buildServiceLandingSchema } from '../src/lib/serviceLandingSchema.js';

const expected = [
  'sablon-kaos-custom',
  'jersey-custom',
  'cetak-undangan',
  'cetak-kemasan',
  'neonbox-reklame',
];
const forbiddenClaims = /termurah|nomor\s*1|terbaik\s+di|garansi\s+100|pasti\s+sehari/i;
const validProductKeys = new Set([
  'dtf', 'a3-kertas-1sisi', 'a3-kertas-2sisi', 'a3-stiker', 'stikerlabel',
  'sticker', 'banner', 'banner-paket', 'rangka-banner', 'laser', 'lanyard',
  'mug', 'pinganci', 'kartu-nama', 'brosur', 'nota', 'stempel', 'banner-kain',
]);

assert.equal(LANDING_PAGES.length, expected.length, 'Harus tepat 5 landing page target');
assert.deepEqual(LANDING_PAGES.map((page) => page.slug).sort(), expected.sort(), 'Slug landing page tidak lengkap');

const sitemapSource = readFileSync(new URL('./generate-sitemap.mjs', import.meta.url), 'utf8');
const homepageSource = readFileSync(new URL('../src/pages/HomeEcommerce.jsx', import.meta.url), 'utf8');

for (const page of LANDING_PAGES) {
  assert.ok(sitemapSource.includes(`/${page.slug}`), `${page.slug}: belum masuk generator sitemap`);
  assert.ok(homepageSource.includes(`/${page.slug}`), `${page.slug}: belum punya internal link dari homepage`);
  assert.ok(page.title && page.title.length >= 20, `${page.slug}: title terlalu pendek`);
  assert.ok(page.description && page.description.length >= 100, `${page.slug}: description terlalu pendek`);
  assert.match(`${page.title} ${page.description}`, /Sragen|Gemolong/, `${page.slug}: sinyal lokasi hilang`);
  assert.ok(page.heroTitle && page.intro?.length >= 120, `${page.slug}: hero/intro terlalu tipis`);
  assert.ok(Array.isArray(page.benefits) && page.benefits.length >= 3, `${page.slug}: minimal 3 manfaat`);
  assert.ok(Array.isArray(page.process) && page.process.length >= 3, `${page.slug}: minimal 3 langkah proses`);
  assert.ok(Array.isArray(page.faqs) && page.faqs.length >= 3, `${page.slug}: minimal 3 FAQ`);
  assert.ok(page.whatsappMessage?.length >= 20, `${page.slug}: CTA WhatsApp tidak jelas`);
  assert.ok(Array.isArray(page.relatedProductKeys) && page.relatedProductKeys.length >= 1, `${page.slug}: perlu internal link produk`);
  for (const key of page.relatedProductKeys) assert.ok(validProductKeys.has(key), `${page.slug}: product key tidak dikenal: ${key}`);

  const allText = JSON.stringify(page);
  assert.doesNotMatch(allText, forbiddenClaims, `${page.slug}: mengandung klaim pemasaran tak terverifikasi`);
  assert.doesNotMatch(allText, /08\d{8,}/, `${page.slug}: nomor WA jangan di-hardcode; ambil dari Site Settings`);

  const service = buildServiceLandingSchema(page);
  assert.equal(service?.['@type'], 'Service', `${page.slug}: Service schema invalid`);
  assert.equal(service.url, `https://www.cetakpixelso.com/${page.slug}`);
  assert.match(service.areaServed.map((area) => area.name).join(' '), /Gemolong.*Sragen/);

  const breadcrumb = buildServiceLandingBreadcrumb(page);
  assert.equal(breadcrumb?.['@type'], 'BreadcrumbList', `${page.slug}: breadcrumb schema invalid`);
  assert.equal(breadcrumb.itemListElement.at(-1)?.item, `https://www.cetakpixelso.com/${page.slug}`);

  const faq = buildServiceLandingFaqSchema(page);
  assert.equal(faq?.['@type'], 'FAQPage', `${page.slug}: FAQ schema invalid`);
  assert.equal(faq.mainEntity.length, page.faqs.length, `${page.slug}: jumlah schema FAQ mismatch`);
}

console.log(`OK: ${LANDING_PAGES.length} landing page lengkap, schema valid, tanpa klaim terlarang.`);
