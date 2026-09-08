import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Pixelso Gemolong';
const SITE_URL = 'https://www.cetakpixelso.com';
const DEFAULT_DESCRIPTION =
  'Mau cetak satuan, jumlah besar, atau kebutuhan yang lebih kompleks? Tenang, Pixelso siap memberikan solusi yang cepat, mudah, dan hasilnya bikin percaya diri.';
const DEFAULT_IMAGE = `${SITE_URL}/uploads/photo-1784070822284-6a34b2a944c1-resto-ceria-515x328pixel.webp`;

// Set title, canonical, dan Open Graph per-halaman - dipanggil di tiap page component.
// Sebelum ini semua halaman (produk/blog/dll) pakai tag statis dari index.html yang cuma
// benar untuk homepage, jadi Google melihat setiap halaman "canonical"-nya ke homepage.
export default function Seo({ title, description = DEFAULT_DESCRIPTION, path = '/', image = DEFAULT_IMAGE, noindex = false }) {
  const fullTitle = title ? `${title} - ${SITE_NAME}` : `${SITE_NAME} - Pesan Cetak Online`;
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, follow" />}

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="id_ID" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
