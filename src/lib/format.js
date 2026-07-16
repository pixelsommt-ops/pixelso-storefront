export function formatCurrency(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}

// Deskripsi produk sekarang HTML (rich text) - dipakai untuk preview teks polos singkat
// di kartu katalog, bukan untuk render (lihat ProductDetail.jsx yang sanitize+render HTML-nya).
export function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export const CATALOG_DESCRIPTION_MAX_LENGTH = 100;

// Ringkasan teks polos untuk kartu katalog - dipotong pendek supaya kartu rapi/konsisten,
// deskripsi lengkap (HTML) tetap tampil utuh di halaman detail produk (ProductDetail.jsx).
export function truncateDescription(html, maxLength = CATALOG_DESCRIPTION_MAX_LENGTH) {
  const plain = stripHtml(html);
  if (plain.length <= maxLength) {
    return { text: plain, isTruncated: false };
  }
  return { text: plain.slice(0, maxLength).trimEnd(), isTruncated: true };
}

export function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
}
