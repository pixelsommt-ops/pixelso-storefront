// Builder structured data (schema.org) untuk halaman produk.
//
// Dipisah dari komponen React supaya logikanya bisa diuji tanpa render (lihat productSchema.test.js)
// dan supaya aturan "kapan sebuah field boleh muncul" terkumpul di satu tempat.
//
// PENTING - kebijakan Google Rich Results yang dipegang di file ini:
//
// 1. TIDAK ADA aggregateRating/review palsu. Pixelso belum menyimpan rating per-produk sama
//    sekali (field-nya tidak ada di API katalog). soldCount BUKAN rating. Mengarang rating =
//    pelanggaran kebijakan spam Google dan bisa kena manual action yang mencabut seluruh rich
//    result domain. Kalau nanti rating asli per-produk sudah ada di ERP, baru tambahkan di sini.
//
// 2. Harga pakai AggregateOffer + lowPrice, BUKAN Offer dengan price tunggal. Harga Pixelso
//    dihitung dari ukuran/bahan/finishing (lihat PriceCalculatorForm), jadi baseRate adalah
//    "harga mulai dari", bukan harga final. Mengklaim price tunggal = harga di Google beda
//    dengan harga sebenarnya di halaman, itu structured data tidak akurat.
//
// 3. Produk tanpa harga (baseRate 0/null, mis. "laser" yang harganya custom) tidak dikasih
//    offers sama sekali - lebih baik tidak ada data harga daripada mengklaim gratis.

const SITE_URL = 'https://www.cetakpixelso.com';
const SITE_NAME = 'Pixelso Gemolong';

function absoluteUrl(path) {
  if (!path) return undefined;
  return /^https?:\/\//i.test(path) ? path : `${SITE_URL}${path}`;
}

function stripHtml(html) {
  return String(html ?? '')
    .replace(/<(p|li|br|div|h[1-6])[^>]*>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Schema Product. Return null kalau produk tidak valid supaya pemanggil bisa skip render.
export function buildProductSchema(product) {
  if (!product || !product.key || !product.name) return null;

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    url: `${SITE_URL}/produk/${product.key}`,
    sku: product.key,
    brand: { '@type': 'Brand', name: SITE_NAME },
  };

  const description = stripHtml(product.description);
  if (description) schema.description = description.slice(0, 500);

  const absoluteImages = images.map(absoluteUrl).filter(Boolean);
  if (absoluteImages.length > 0) schema.image = absoluteImages;

  if (product.category) schema.category = product.category;

  // Harga: hanya kalau baseRate benar-benar ada dan > 0 (lihat catatan 2 & 3 di atas).
  const baseRate = Number(product.baseRate);
  if (Number.isFinite(baseRate) && baseRate > 0) {
    schema.offers = {
      '@type': 'AggregateOffer',
      priceCurrency: 'IDR',
      lowPrice: baseRate,
      availability: product.active === false
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: SITE_NAME },
      url: `${SITE_URL}/produk/${product.key}`,
    };
  }

  return schema;
}

// Schema BreadcrumbList: Beranda > Katalog > [Kategori] > Nama Produk.
// Kategori ditaruh sebagai item katalog ter-filter (?kategori=) - itu URL yang memang ada di app,
// jadi breadcrumb-nya mengarah ke halaman yang benar-benar bisa dibuka, bukan URL karangan.
export function buildBreadcrumbSchema(product) {
  if (!product || !product.key || !product.name) return null;

  const items = [
    { name: 'Beranda', item: `${SITE_URL}/` },
    { name: 'Katalog', item: `${SITE_URL}/katalog` },
  ];

  if (product.category) {
    items.push({
      name: product.category,
      item: `${SITE_URL}/katalog?kategori=${encodeURIComponent(product.category)}`,
    });
  }

  items.push({ name: product.name, item: `${SITE_URL}/produk/${product.key}` });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

export const __test__ = { absoluteUrl, stripHtml, SITE_URL, SITE_NAME };

// --- BLOG ---------------------------------------------------------------------------------
//
// Schema Article untuk halaman artikel blog.
//
// Catatan kebijakan:
//
// - TIDAK ada dateModified. API blog hanya menyediakan publishedAt; tidak ada updatedAt sama
//   sekali. Menyalin publishedAt jadi dateModified = mengklaim artikel "baru diperbarui" padahal
//   tidak, dan Google memakai sinyal itu untuk freshness. Biarkan kosong sampai ERP menyimpan
//   waktu edit yang sebenarnya.
//
// - publisher memakai logo brand (bukan foto portofolio) karena Google menampilkannya sebagai
//   identitas penerbit di hasil pencarian.
export function buildArticleSchema(post) {
  if (!post || !post.slug || !post.title) return null;

  const url = `${SITE_URL}/blog/${post.slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title.slice(0, 110), // Google memotong headline di ~110 karakter
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-pixelso-persegi.png` },
    },
  };

  const description = stripHtml(post.content);
  if (description) schema.description = description.slice(0, 300);

  const image = absoluteUrl(post.coverImageUrl);
  if (image) schema.image = [image];

  if (post.publishedAt) schema.datePublished = post.publishedAt;
  if (post.author?.name) schema.author = { '@type': 'Person', name: post.author.name };

  return schema;
}

// --- PORTFOLIO -----------------------------------------------------------------------------
//
// Schema untuk halaman portofolio (studi kasus pekerjaan nyata).
//
// Catatan kebijakan:
//
// - Dipakai @type CreativeWork, BUKAN Product. Halaman portofolio menceritakan
//   pekerjaan yang SUDAH selesai untuk pelanggan tertentu - barang itu tidak
//   dijual ulang apa adanya. Memberi Product+offers pada studi kasus =
//   mengklaim ada barang yang bisa dibeli di URL itu, padahal pembelian
//   terjadi di halaman produk. Tombol CTA-lah yang mengarah ke sana.
//
// - TIDAK ada aggregateRating/review, konsisten dengan kebijakan di atas.
//
// - `client` hanya dimasukkan kalau memang diisi. Sebagian pelanggan tidak
//   mau namanya dipublikasikan.
export function buildPortfolioSchema(item) {
  if (!item || !item.slug || !item.title) return null;

  const url = `${SITE_URL}/portfolio/${item.slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: item.title,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    creator: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` },
  };

  const description = [item.need, item.process, item.result]
    .filter(Boolean)
    .join(' ')
    .trim();
  if (description) schema.description = stripHtml(description).slice(0, 500);

  const images = (Array.isArray(item.images) ? item.images : [])
    .map(absoluteUrl)
    .filter(Boolean);
  if (images.length > 0) schema.image = images;

  if (item.publishedAt) schema.datePublished = item.publishedAt;
  if (item.category) schema.genre = item.category;
  if (item.material) schema.material = item.material;
  if (item.location) schema.locationCreated = { '@type': 'Place', name: item.location };
  if (item.client) schema.sponsor = { '@type': 'Organization', name: item.client };

  return schema;
}

// Breadcrumb portofolio: Beranda > Portofolio > Judul Pekerjaan.
export function buildPortfolioBreadcrumbSchema(item) {
  if (!item || !item.slug || !item.title) return null;

  const items = [
    { name: 'Beranda', item: `${SITE_URL}/` },
    { name: 'Portofolio', item: `${SITE_URL}/portfolio` },
    { name: item.title, item: `${SITE_URL}/portfolio/${item.slug}` },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

// Breadcrumb artikel: Beranda > Blog > Judul Artikel.
export function buildBlogBreadcrumbSchema(post) {
  if (!post || !post.slug || !post.title) return null;

  const items = [
    { name: 'Beranda', item: `${SITE_URL}/` },
    { name: 'Blog', item: `${SITE_URL}/blog` },
    { name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}
