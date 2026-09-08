// Unified conversion tracking (Fase 1.A) - GA4 (sudah live sejak 2026-07-15) + Meta Pixel +
// TikTok Pixel + Google Ads conversion, semua lewat helper yang sama supaya tiap event bisnis
// cukup dipanggil sekali dari komponen dan otomatis terkirim ke semua platform yang aktif.
// ID pixel/conversion datang dari .env (lihat .env.example) - kalau sebuah ID belum diisi, base
// script-nya di index.html tidak pernah jalan (window.fbq/window.ttq tidak pernah ada), jadi
// helper di bawah ini aman dipanggil sebelum akun iklan yang bersangkutan dibuat.

function hasFn(name) {
  return typeof window !== 'undefined' && typeof window[name] === 'function';
}

// First-touch UTM: disimpan sekali per pengunjung (localStorage, bukan sessionStorage) supaya
// tetap ada walau dia baru checkout/chat WA beberapa hari setelah klik iklan. Dipanggil dari
// StorefrontLayout.jsx sekali tiap ganti rute - hanya menulis kalau ada param utm_* di URL dan
// belum pernah tersimpan, jadi selalu first-touch bukan last-touch.
const UTM_STORAGE_KEY = 'pixelso_first_touch_utm';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

export function captureUtmFromUrl(search) {
  if (typeof window === 'undefined' || localStorage.getItem(UTM_STORAGE_KEY)) return;
  const params = new URLSearchParams(search || window.location.search);
  const utm = {};
  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) utm[key] = value;
  });
  if (Object.keys(utm).length > 0) {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify({ ...utm, capturedAt: new Date().toISOString() }));
  }
}

function getStoredUtm() {
  try {
    const raw = JSON.parse(localStorage.getItem(UTM_STORAGE_KEY) || 'null');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

// GA4 pageview tracking untuk navigasi client-side (React Router) - tag gtag.js sendiri
// dipasang di index.html (send_page_view: false di sana), pageview pertama saat load penuh
// tetap tercatat otomatis oleh gtag.js sendiri, jadi di sini cukup kirim tiap ganti rute.
// Meta Pixel & TikTok Pixel juga hanya auto-fire PageView sekali saat base script dimuat -
// disamakan di sini supaya SPA navigation tetap dihitung "page view" oleh ketiga platform.
export function trackPageview(path, title) {
  if (hasFn('gtag')) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href,
    });
  }
  if (hasFn('fbq')) window.fbq('track', 'PageView');
  if (window.ttq && typeof window.ttq.page === 'function') window.ttq.page();
}

// Dipanggil saat halaman detail produk selesai dimuat (pages/ProductDetail.jsx).
export function trackViewContent(product) {
  const value = Number(product?.baseRate) || 0;
  if (hasFn('gtag')) {
    window.gtag('event', 'view_item', {
      currency: 'IDR',
      value,
      items: [{
        item_id: product.key,
        item_name: product.name,
        item_category: product.category || undefined,
        price: value,
        quantity: 1,
      }],
    });
  }
  if (hasFn('fbq')) {
    window.fbq('track', 'ViewContent', {
      content_ids: [product.key],
      content_name: product.name,
      content_type: 'product',
      currency: 'IDR',
      value,
    });
  }
  if (window.ttq) {
    window.ttq.track('ViewContent', {
      contents: [{ content_id: product.key, content_name: product.name }],
      currency: 'IDR',
      value,
    });
  }
}

// Dipanggil saat item ditambahkan ke keranjang (pages/ProductDetail.jsx).
export function trackAddToCart(product, estimatedValue) {
  const value = Number(estimatedValue) || 0;
  if (hasFn('gtag')) {
    window.gtag('event', 'add_to_cart', {
      currency: 'IDR',
      value,
      items: [{
        item_id: product.key,
        item_name: product.name,
        item_category: product.category || undefined,
        price: value,
        quantity: 1,
      }],
    });
  }
  if (hasFn('fbq')) {
    window.fbq('track', 'AddToCart', {
      content_ids: [product.key],
      content_name: product.name,
      content_type: 'product',
      currency: 'IDR',
      value,
    });
  }
  if (window.ttq) {
    window.ttq.track('AddToCart', {
      contents: [{ content_id: product.key, content_name: product.name }],
      currency: 'IDR',
      value,
    });
  }
}

// Dipanggil saat pengunjung lanjut dari Keranjang ke Checkout (pages/Cart.jsx).
// item.estimatedTotal adalah total baris (bukan harga satuan) - produk cetak custom dihitung
// dari luas/dimensi+finishing, bukan harga tetap per pcs, jadi "price" per unit didekati dengan
// membagi total baris dengan quantity supaya tetap mengisi skema item GA4/Meta/TikTok yang standar.
function toGa4Item(i) {
  const quantity = Number(i.quantity) || 1;
  const lineTotal = Number(i.estimatedTotal) || 0;
  return {
    item_id: i.productKey,
    item_name: i.productName,
    item_category: i.category || undefined,
    price: quantity > 0 ? lineTotal / quantity : lineTotal,
    quantity,
  };
}

export function trackInitiateCheckout(items, total) {
  const value = Number(total) || 0;
  if (hasFn('gtag')) {
    window.gtag('event', 'begin_checkout', {
      currency: 'IDR',
      value,
      items: items.map(toGa4Item),
    });
  }
  if (hasFn('fbq')) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: items.map((i) => i.productKey),
      contents: items.map((i) => {
        const g = toGa4Item(i);
        return { id: g.item_id, quantity: g.quantity, item_price: g.price };
      }),
      content_type: 'product',
      currency: 'IDR',
      value,
      num_items: items.length,
    });
  }
  if (window.ttq) {
    window.ttq.track('InitiateCheckout', {
      contents: items.map((i) => {
        const g = toGa4Item(i);
        return {
          content_id: g.item_id,
          content_name: g.item_name,
          content_category: g.item_category,
          quantity: g.quantity,
          price: g.price,
        };
      }),
      currency: 'IDR',
      value,
    });
  }
}

// Dipanggil setelah PO berhasil dibuat lewat checkout (pages/Checkout.jsx) - conversion utama
// yang disebut di rencana Fase 1.A ("Purchase"). Kalau VITE_GOOGLE_ADS_CONVERSION_ID + LABEL
// sudah diisi (lihat .env.example), event ini juga sekaligus memicu conversion Google Ads lewat
// gtag.js yang sama (tidak perlu script terpisah).
export function trackPurchase(order, items = []) {
  const value = Number(order?.total) || 0;
  const transactionId = String(order?.poId || '');
  const utm = getStoredUtm();
  const ga4Items = items.map(toGa4Item);

  if (hasFn('gtag')) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      currency: 'IDR',
      value,
      items: ga4Items,
      ...utm,
    });
    const adsId = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_ID;
    const adsLabel = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_LABEL;
    if (adsId && adsLabel) {
      window.gtag('event', 'conversion', {
        send_to: `${adsId}/${adsLabel}`,
        value,
        currency: 'IDR',
        transaction_id: transactionId,
      });
    }
  }
  if (hasFn('fbq')) {
    window.fbq('track', 'Purchase', {
      currency: 'IDR',
      value,
      content_ids: ga4Items.map((i) => i.item_id),
      contents: ga4Items.map((i) => ({ id: i.item_id, quantity: i.quantity, item_price: i.price })),
      content_type: 'product',
      ...utm,
    });
  }
  if (window.ttq) {
    window.ttq.track('Purchase', {
      currency: 'IDR',
      value,
      order_id: transactionId,
      contents: ga4Items.map((i) => ({
        content_id: i.item_id,
        content_name: i.item_name,
        content_category: i.item_category,
        quantity: i.quantity,
        price: i.price,
      })),
      ...utm,
    });
  }
}

// Dipanggil setiap tombol/link "Chat WhatsApp" diklik (StorefrontLayout, SubNav, JamLayanan,
// Checkout) - custom event "Contact" yang disebut di rencana Fase 1.A. WA sendiri tidak
// meneruskan UTM ke percakapan, jadi first-touch UTM disertakan di event ini supaya sumber
// iklan yang membawa klik WA tetap terlihat di laporan GA4/Meta/TikTok.
export function trackContact(source) {
  const utm = getStoredUtm();
  if (hasFn('gtag')) window.gtag('event', 'contact', { method: 'whatsapp', source, ...utm });
  if (hasFn('fbq')) window.fbq('trackCustom', 'Contact', { source, ...utm });
  if (window.ttq) window.ttq.track('Contact', { source, ...utm });
}
