import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as catalogService from '../services/catalogService';
import ProductCard from '../components/ProductCard';
import ValuePropTiles from '../components/ValuePropTiles';
import CaraPesanSteps from '../components/CaraPesanSteps';
import HeroCarousel from '../components/HeroCarousel';
import RichText from '../components/RichText';
import useSiteSettingsStore from '../store/siteSettingsStore';
import useAuthStore from '../store/authStore';

export default function Home() {
  const [catalog, setCatalog] = useState(null);
  const business = useSiteSettingsStore((s) => s.settings);
  const customer = useAuthStore((s) => s.customer);

  useEffect(() => {
    catalogService.getCatalog().then(({ data }) => setCatalog(data));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="eyebrow">{business.tagline}</span>
            <h1 style={{ fontSize: '2.4rem' }}>Pesan Cetak Online, Prosesnya Cepat &amp; Transparan</h1>
            <RichText html={business.description} className="text-muted" style={{ fontSize: '1rem', maxWidth: 480 }} />
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <Link to="/katalog" className="btn btn-primary">Lihat Katalog</Link>
              {!customer && <Link to="/login" className="btn btn-secondary">Login</Link>}
            </div>
          </div>
          {business.heroSlides?.length > 0 ? (
            <HeroCarousel slides={business.heroSlides} altText={business.name} />
          ) : (
            <div className="card" style={{ textAlign: 'center' }}>
              <p className="text-muted" style={{ margin: 0 }}>{business.address}</p>
              <p style={{ fontWeight: 800, color: 'var(--maroon-800)', margin: '8px 0' }}>{business.openingHours}</p>
            </div>
          )}
        </div>
      </section>

      <section className="section container">
        <ValuePropTiles />
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Produk Populer</h2>
          <p className="text-muted">Estimasi harga otomatis sesuai ukuran, bahan, dan finishing pilihan Anda.</p>
        </div>
        <div className="grid grid-4">
          {(catalog?.products || []).filter((p) => p.active).map((p) => (
            <ProductCard key={p.key} product={p} />
          ))}
        </div>
      </section>

      {business.galleryImages?.length > 0 && (
        <section className="section container">
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
                  style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
                {g.caption && <p className="text-muted" style={{ fontSize: '0.85rem', margin: '8px 0 0' }}>{g.caption}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section container">
        <div className="section-head">
          <h2>Cara Pesan</h2>
        </div>
        <CaraPesanSteps />
      </section>
    </div>
  );
}
