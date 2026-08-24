import apiClient from '../services/apiClient';

// A/B test beranda (2026-07-30): "model e-commerce" (gaya Shopee - grid kategori dulu) vs
// "model hero" (yang sekarang live - headline besar + foto hero + strip produk). Assignment
// disimpan permanen (localStorage) supaya pengunjung yang sama selalu lihat variant yang sama
// tiap kunjungan - kalau berubah-ubah, datanya tidak valid buat dibandingkan.
// Hasil bisa dicek di ERP > Hasil Eksperimen (backend: GET /api/experiments/:key/report).
export const EXPERIMENT_KEY = 'home_layout_2026_07';
const VARIANTS = ['ecommerce', 'hero'];

const STORAGE_VARIANT_KEY = 'pixelso_experiment_home_variant';
const STORAGE_SESSION_KEY = 'pixelso_experiment_session_id';
const SESSION_VIEW_SENT_KEY = 'pixelso_experiment_view_sent';

function getSessionId() {
  let id = localStorage.getItem(STORAGE_SESSION_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(STORAGE_SESSION_KEY, id);
  }
  return id;
}

// Gagal kirim tracking tidak boleh mengganggu pengalaman belanja - dibiarkan diam saja.
function sendTrackEvent(variant, eventType, poId) {
  apiClient
    .post('/experiments/track', {
      experimentKey: EXPERIMENT_KEY,
      variant,
      eventType,
      sessionId: getSessionId(),
      ...(poId ? { poId } : {}),
    })
    .catch(() => {});
}

// Preview manual buat cek tampilan sendiri - buka /?variant=hero atau /?variant=ecommerce.
// SENGAJA tidak disimpan & tidak dihitung ke data eksperimen (bukan pengunjung asli hasil
// randomisasi) - beda dari assignment normal di bawah.
function getPreviewOverride() {
  const params = new URLSearchParams(window.location.search);
  const variant = params.get('variant');
  return VARIANTS.includes(variant) ? variant : null;
}

// Dipanggil dari Home.jsx buat nentuin variant mana yang dirender.
export function getHomeVariant() {
  const preview = getPreviewOverride();
  if (preview) return preview;

  let variant = localStorage.getItem(STORAGE_VARIANT_KEY);
  if (!variant || !VARIANTS.includes(variant)) {
    variant = Math.random() < 0.5 ? 'ecommerce' : 'hero';
    localStorage.setItem(STORAGE_VARIANT_KEY, variant);
  }

  // sessionStorage (bukan localStorage) - cuma buat kurangi request berulang tiap balik ke
  // beranda dalam satu sesi tab, bukan buat dedup unique visitor (itu tugas backend via Set
  // sessionId, lihat experiment.service.js#getReport).
  if (!sessionStorage.getItem(SESSION_VIEW_SENT_KEY)) {
    sendTrackEvent(variant, 'view');
    sessionStorage.setItem(SESSION_VIEW_SENT_KEY, '1');
  }

  return variant;
}

// Dipanggil setelah checkout sukses (PO tercipta) - lihat pages/Checkout.jsx.
export function trackCheckoutConversion(poId) {
  const variant = localStorage.getItem(STORAGE_VARIANT_KEY);
  if (!variant) return;
  sendTrackEvent(variant, 'checkout', poId);
}
