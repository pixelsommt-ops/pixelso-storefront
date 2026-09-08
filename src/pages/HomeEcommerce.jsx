import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import HeroCarousel from '../components/HeroCarousel';
import ValuePropTiles from '../components/ValuePropTiles';
import CaraPesanSteps from '../components/CaraPesanSteps';
import FaqAccordion from '../components/FaqAccordion';
import ScrollReveal from '../components/ScrollReveal';
import RichText from '../components/RichText';
import useSiteSettingsStore from '../store/siteSettingsStore';

// Variant "ecommerce" dari A/B test beranda (lib/experiment.js) - gaya marketplace (Shopee):
// banner tipis, grid kategori, lalu deretan section landing-page (2026-07-30, referensi
// vendormurah.net) sebelum grid produk & CTA penutup. Tiap section fade-in singkat saat
// discroll (lihat ScrollReveal.jsx) - beda dari HomeHero.jsx yang tanpa animasi scroll.
export default function HomeEcommerce({ activeProducts, visibleProducts, sentinelRef }) {
  const business = useSiteSettingsStore((s) => s.settings);

  const byCategory = new Map();
  activeProducts.forEach((p) => {
    const name = p.category || 'Lainnya';
    if (!byCategory.has(name)) byCategory.set(name, { count: 0, imageUrl: null });
    const entry = byCategory.get(name);
    entry.count += 1;
    if (!entry.imageUrl && p.imageUrl) entry.imageUrl = p.imageUrl;
  });
  const categories = Array.from(byCategory.entries());

  return (
    <div className="ecommerce-home">
      {/* Visually hidden - variant ini sengaja tanpa headline besar (gaya marketplace), tapi
          halaman tetap butuh H1 unik untuk SEO/aksesibilitas (screen reader). */}
      <h1 style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        {business.heroHeadline || 'Pesan Cetak Online, Prosesnya Cepat & Transparan - Pixelso Gemolong'}
      </h1>
      {business.heroSlides?.length > 0 && (
        <section className="container" style={{ paddingTop: 16 }}>
          <div className="ecommerce-banner">
            <HeroCarousel slides={business.heroSlides} altText={business.name} />
          </div>
        </section>
      )}

      <section className="section container">
        <div className="section-head section-head-center">
          <h2>Kategori</h2>
        </div>
        {categories.length === 0 ? (
          <p className="text-muted">Belum ada produk.</p>
        ) : (
          <div className="kategori-grid">
            {categories.map(([name, { count, imageUrl }]) => (
              <Link key={name} to={`/katalog?kategori=${encodeURIComponent(name)}`} className="kategori-tile">
                <span className="kategori-tile-icon">
                  {imageUrl ? <img src={imageUrl} alt={name} /> : name.charAt(0)}
                </span>
                <span>{name}</span>
                <span className="text-muted" style={{ fontSize: '0.7rem' }}>{count} produk</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <ScrollReveal as="section" className="section container">
        <div className="section-head section-head-center">
          <h2>Tentang CetakPixelso</h2>
        </div>
        <div className="card">
          <h3>{business.name}</h3>
          <RichText html={business.description} style={{ marginTop: '0.5rem' }} />
          <p className="text-muted" style={{ marginTop: '1rem', marginBottom: 0 }}>{business.address}</p>
        </div>
      </ScrollReveal>

      <ScrollReveal as="section" className="section container">
        <div className="section-head section-head-center">
          <h2>Kenapa Memilih Kami?</h2>
        </div>
        <ValuePropTiles />
      </ScrollReveal>

      <ScrollReveal as="section" className="section container">
        <div className="section-head section-head-center">
          <h2>Produk Terbaik Pixelso</h2>
          <p className="text-muted section-head-desc">Estimasi harga otomatis sesuai ukuran, bahan, dan finishing pilihan Anda.</p>
        </div>
        <div className="grid grid-4 product-grid">
          {visibleProducts.map((p) => (
            <ProductCard key={p.key} product={p} />
          ))}
        </div>
        <div ref={sentinelRef} />
      </ScrollReveal>

      <ScrollReveal as="section" className="section container">
        <div className="section-head section-head-center">
          <h2>Cara Pemesanan dan Proses Kerja di CetakPixelso</h2>
        </div>
        <CaraPesanSteps />
      </ScrollReveal>

      <ScrollReveal as="section" className="section container">
        <div className="section-head section-head-center">
          <h2>Got Questions?</h2>
          <p className="text-muted section-head-desc">Pertanyaan yang sering ditanyakan seputar pemesanan.</p>
        </div>
        <FaqAccordion />
      </ScrollReveal>

      {business.galleryImages?.length > 0 && (
        <ScrollReveal as="section" className="section container">
          <div className="section-head section-head-center">
            <h2>Our Client Gallery</h2>
            <p className="text-muted">Sebagian hasil kerja dan suasana produksi kami.</p>
          </div>
          <div className="grid grid-3 ecommerce-gallery-grid">
            {business.galleryImages.map((g, index) => (
              <div key={index} className="card card-sm" style={{ padding: '0.75rem' }}>
                <img
                  src={g.url}
                  alt={g.caption || business.name}
                  style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: '3px' }}
                />
                {g.caption && <p className="text-muted" style={{ fontSize: '0.85rem', margin: '8px 0 0' }}>{g.caption}</p>}
              </div>
            ))}
          </div>
        </ScrollReveal>
      )}

      {business.googleMapsEmbedUrl && (
        <ScrollReveal as="section" className="section container">
          <div className="section-head section-head-center">
            <h2>Lokasi Kantor Kami</h2>
            <p className="text-muted">{business.address}</p>
          </div>
          <div className="location-map-frame">
            <iframe
              src={business.googleMapsEmbedUrl}
              title={`Lokasi ${business.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </ScrollReveal>
      )}

      <ScrollReveal as="section" className="section container">
        <div className="ecommerce-cta">
          <h2 style={{ color: '#fff' }}>Siap Cetak Bareng Kami?</h2>
          <p style={{ margin: '8px 0 20px' }}>Kualitas terjamin, proses cepat, harga transparan - mulai pesan sekarang.</p>
          <Link to="/katalog" className="btn ecommerce-cta-btn">PESAN SEKARANG</Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
