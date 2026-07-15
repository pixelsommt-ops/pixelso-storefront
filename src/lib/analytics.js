// GA4 pageview tracking untuk navigasi client-side (React Router) - tag gtag.js sendiri
// dipasang di index.html (send_page_view: false di sana), pageview pertama saat load penuh
// tetap tercatat otomatis oleh gtag.js sendiri, jadi di sini cukup kirim tiap ganti rute.
export function trackPageview(path, title) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  });
}
