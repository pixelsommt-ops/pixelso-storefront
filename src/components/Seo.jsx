import { useEffect } from 'react';

const SITE_NAME = 'Pixelso Gemolong';
const SITE_URL = 'https://www.cetakpixelso.com';
const DEFAULT_DESCRIPTION =
  'Mau cetak satuan, jumlah besar, atau kebutuhan yang lebih kompleks? Tenang, Pixelso siap memberikan solusi yang cepat, mudah, dan hasilnya bikin percaya diri.';
const DEFAULT_IMAGE = `${SITE_URL}/uploads/photo-1784070822284-6a34b2a944c1-resto-ceria-515x328pixel.webp`;

// Cari (atau buat) satu <meta>/<link> lalu set atributnya. Dipakai bukan react-helmet-async -
// library itu ternyata tidak menyentuh DOM sama sekali di project ini meski sudah dicoba 2 versi
// beda + tanpa StrictMode (didiagnosa cukup lama, tidak ketemu akar masalahnya) - manipulasi DOM
// langsung lebih sederhana & pasti bekerja untuk SPA client-side-only seperti ini (tidak ada SSR).
function setTag(selector, createTag, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = createTag();
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

// Set title, canonical, dan Open Graph per-halaman - dipanggil di tiap page component.
// Sebelum ini semua halaman (produk/blog/dll) pakai tag statis dari index.html yang cuma
// benar untuk homepage, jadi Google melihat setiap halaman "canonical"-nya ke homepage.
export default function Seo({ title, description = DEFAULT_DESCRIPTION, path = '/', image = DEFAULT_IMAGE, noindex = false }) {
  const fullTitle = title ? `${title} - ${SITE_NAME}` : `${SITE_NAME} - Pesan Cetak Online`;
  const url = `${SITE_URL}${path}`;

  useEffect(() => {
    document.title = fullTitle;

    setTag('link[rel="canonical"]', () => document.createElement('link'), { rel: 'canonical', href: url });

    setTag('meta[name="description"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      return m;
    }, { content: description });

    const robotsSelector = 'meta[name="robots"]';
    if (noindex) {
      setTag(robotsSelector, () => {
        const m = document.createElement('meta');
        m.setAttribute('name', 'robots');
        return m;
      }, { content: 'noindex, follow' });
    } else {
      document.head.querySelector(robotsSelector)?.remove();
    }

    const og = {
      'og:type': 'website',
      'og:url': url,
      'og:site_name': SITE_NAME,
      'og:locale': 'id_ID',
      'og:title': fullTitle,
      'og:description': description,
      'og:image': image,
    };
    Object.entries(og).forEach(([prop, content]) => {
      setTag(`meta[property="${prop}"]`, () => {
        const m = document.createElement('meta');
        m.setAttribute('property', prop);
        return m;
      }, { content });
    });

    const twitter = {
      'twitter:card': 'summary_large_image',
      'twitter:title': fullTitle,
      'twitter:description': description,
      'twitter:image': image,
    };
    Object.entries(twitter).forEach(([name, content]) => {
      setTag(`meta[name="${name}"]`, () => {
        const m = document.createElement('meta');
        m.setAttribute('name', name);
        return m;
      }, { content });
    });
  }, [fullTitle, description, url, image, noindex]);

  return null;
}
