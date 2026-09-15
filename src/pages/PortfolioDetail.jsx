import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import JsonLd from '../components/JsonLd';
import { getPortfolioItem } from '../data/portfolio';
import { buildPortfolioSchema, buildPortfolioBreadcrumbSchema } from '../lib/productSchema';
import useCatalogStore from '../store/catalogStore';

// Baris spesifikasi - hanya dirender kalau datanya ada, supaya tidak muncul
// label kosong yang membuat halaman terlihat tipis.
function Spec({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--line)' }}>
      <span className="text-muted" style={{ minWidth: 130, fontSize: '0.85rem' }}>{label}</span>
      <span style={{ fontSize: '0.9rem' }}>{value}</span>
    </div>
  );
}

export default function PortfolioDetail() {
  const { slug } = useParams();
  const item = getPortfolioItem(slug);

  const products = useCatalogStore((s) => s.products);
  const fetchCatalog = useCatalogStore((s) => s.fetchCatalog);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  if (!item) {
    return (
      <div className="section container">
        {/* noindex: URL portofolio yang tidak ada jangan sampai terindeks sebagai halaman kosong */}
        <Seo title="Portofolio tidak ditemukan" path={`/portfolio/${slug}`} noindex />
        <div className="alert alert-error">Portofolio tidak ditemukan.</div>
        <Link to="/portfolio" className="btn btn-secondary">Kembali ke Portofolio</Link>
      </div>
    );
  }

  const related = products.find((p) => p.key === item.relatedProductKey && p.active);
  const description = [item.need, item.result].filter(Boolean).join(' ');

  return (
    <div className="section container">
      <Seo
        title={item.title}
        description={description.slice(0, 200) || undefined}
        path={`/portfolio/${item.slug}`}
        image={item.images?.[0]}
      />
      <JsonLd id="portfolio" data={buildPortfolioSchema(item)} />
      <JsonLd id="breadcrumb" data={buildPortfolioBreadcrumbSchema(item)} />

      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <Link to="/portfolio" className="text-muted" style={{ fontSize: '0.85rem' }}>
          &larr; Kembali ke Portofolio
        </Link>

        <h1 style={{ marginTop: '0.75rem' }}>{item.title}</h1>
        <p className="text-muted" style={{ marginTop: '0.25rem' }}>
          {[item.category, item.location].filter(Boolean).join(' - ')}
        </p>

        {item.images?.[0] && (
          <img
            src={item.images[0]}
            alt={`${item.title}${item.location ? ` di ${item.location}` : ''} - hasil cetak Pixelso Gemolong`}
            loading="eager"
            fetchPriority="high"
            style={{ width: '100%', maxHeight: 460, objectFit: 'cover', borderRadius: '3px', margin: '1rem 0' }}
          />
        )}

        <h2 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>Spesifikasi</h2>
        <div style={{ marginTop: '0.5rem' }}>
          <Spec label="Klien" value={item.client} />
          <Spec label="Lokasi" value={item.location} />
          <Spec label="Ukuran" value={item.size} />
          <Spec label="Bahan" value={item.material} />
          <Spec label="Finishing" value={item.finishing} />
          <Spec label="Jumlah" value={item.quantity} />
          <Spec label="Waktu pengerjaan" value={item.duration} />
        </div>

        {item.need && (
          <>
            <h2 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>Kebutuhan</h2>
            <p style={{ lineHeight: 1.7 }}>{item.need}</p>
          </>
        )}

        {item.process && (
          <>
            <h2 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>Proses Pengerjaan</h2>
            <p style={{ lineHeight: 1.7 }}>{item.process}</p>
          </>
        )}

        {item.result && (
          <>
            <h2 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>Hasil</h2>
            <p style={{ lineHeight: 1.7 }}>{item.result}</p>
          </>
        )}

        {/* Foto tambahan */}
        {item.images?.length > 1 && (
          <div className="grid grid-4 product-grid" style={{ marginTop: '1.5rem' }}>
            {item.images.slice(1).map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`${item.title} - dokumentasi ${i + 2}`}
                loading="lazy"
                style={{ width: '100%', borderRadius: '3px' }}
              />
            ))}
          </div>
        )}

        {/* CTA - inti halaman portofolio: arahkan ke halaman produk yang bisa dipesan.
            Pola dari strategi: Artikel -> Landing Page -> Portfolio -> Order. */}
        <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', marginTop: 0 }}>
            Butuh {item.category ? item.category.toLowerCase() : 'cetakan'} seperti ini?
          </h2>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>
            Kami kerjakan sesuai ukuran dan kebutuhan Anda.
          </p>
          {related ? (
            <Link to={`/produk/${related.key}`} className="btn btn-primary">
              Lihat layanan {related.name}
            </Link>
          ) : (
            <Link to="/katalog" className="btn btn-primary">Lihat Katalog</Link>
          )}
        </div>
      </div>
    </div>
  );
}
