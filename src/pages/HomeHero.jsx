import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ValuePropTiles from '../components/ValuePropTiles';
import CaraPesanSteps from '../components/CaraPesanSteps';
import HeroCarousel from '../components/HeroCarousel';
import HeroProductStrip from '../components/HeroProductStrip';
import RichText from '../components/RichText';
import useSiteSettingsStore from '../store/siteSettingsStore';
import useAuthStore from '../store/authStore';

// Variant "hero" dari A/B test beranda (lib/experiment.js) - headline besar + foto hero + strip
// produk, gaya referensi "Wild Skate" (2026-07-30). Data produk (visibleProducts/sentinelRef)
// datang dari Home.jsx supaya tidak fetch ulang tiap ganti variant.
export default function HomeHero({ visibleProducts, sentinelRef }) {
  const business = useSiteSettingsStore((s) => s.settings);
  const customer = useAuthStore((s) => s.customer);

  return (
    <div>
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-copy">
              <span className="hero-tagline">{business.heroEyebrow || business.tagline}</span>
              <h1 style={{ fontSize: '2.6rem' }}>{business.heroHeadline || 'Pesan Cetak Online, Prosesnya Cepat & Transparan'}</h1>
              <RichText html={business.description} className="text-muted" style={{ fontSize: '1rem', maxWidth: 480 }} />
              <div className="hero-cta-row">
                <Link to="/katalog" className="hero-cta-btn">Lihat Katalog</Link>
                {!customer && <Link to="/login" className="btn btn-secondary">Login</Link>}
              </div>
            </div>
            <div className="hero-visual">
              <span className="hero-ghost-text">{new Date().getFullYear()}</span>
              {business.heroSlides?.length > 0 ? (
                <HeroCarousel slides={business.heroSlides} altText={business.name} />
              ) : (
                <div className="card hero-fallback-card">
                  <p className="text-muted" style={{ margin: 0 }}>{business.address}</p>
                  <p style={{ fontWeight: 800, color: 'var(--maroon-800)', margin: '8px 0' }}>{business.openingHours}</p>
                </div>
              )}
            </div>
          </div>
          <HeroProductStrip products={visibleProducts.slice(0, 8)} />
        </div>
      </section>

      <section className="section container home-secondary">
        <ValuePropTiles />
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Produk Populer</h2>
          <p className="text-muted section-head-desc">Estimasi harga otomatis sesuai ukuran, bahan, dan finishing pilihan Anda.</p>
        </div>
        <div className="grid grid-4 product-grid">
          {visibleProducts.map((p) => (
            <ProductCard key={p.key} product={p} />
          ))}
        </div>
        <div ref={sentinelRef} />
      </section>

      {business.galleryImages?.length > 0 && (
        <section className="section container home-secondary">
          <div className="section-head">
            <h2>Galeri</h2>
            <p className="text-muted">Sebagian hasil kerja dan suasana produksi kami.</p>
          </div>
          <div className="grid grid-3">
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
        </section>
      )}

      {business.googleMapsEmbedUrl && (
        <section className="section container home-secondary">
          <div className="section-head">
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
        </section>
      )}

      <section className="section container home-secondary">
        <div className="section-head">
          <h2>Cara Pesan</h2>
        </div>
        <CaraPesanSteps />
      </section>
    </div>
  );
}
