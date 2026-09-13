import { useEffect } from 'react';

// Inject structured data (schema.org JSON-LD) per-halaman ke <head>.
//
// Kenapa manipulasi DOM langsung (sama seperti Seo.jsx): SPA ini client-side-only tanpa SSR,
// dan react-helmet-async terbukti tidak menyentuh DOM di project ini (lihat catatan di Seo.jsx).
//
// Kenapa ini bekerja untuk Google: sejak Googlebot/bingbot dikeluarkan dari daftar bot di
// nginx conf.d/social-bots.conf, crawler mesin pencari menerima SPA penuh dan menjalankan
// JavaScript, jadi script yang di-inject di sini ikut terbaca saat rendering.
//
// Tiap instance menandai script-nya dengan data-jsonld={id} supaya bisa di-replace saat
// navigasi antar produk dan dibersihkan saat unmount - tanpa ini, pindah dari produk A ke
// produk B akan menumpuk dua Product schema sekaligus di halaman yang sama.
export default function JsonLd({ id, data }) {
  const json = data ? JSON.stringify(data) : null;

  useEffect(() => {
    if (!json) return undefined;

    const selector = `script[data-jsonld="${id}"]`;
    let el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.setAttribute('data-jsonld', id);
      document.head.appendChild(el);
    }
    el.textContent = json;

    return () => {
      document.head.querySelector(selector)?.remove();
    };
  }, [id, json]);

  return null;
}
