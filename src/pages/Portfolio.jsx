import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Seo from '../components/Seo';
import JsonLd from '../components/JsonLd';
import * as portfolioService from '../services/portfolioService';

const SITE_URL = 'https://www.cetakpixelso.com';

// ItemList supaya Google paham halaman ini daftar karya, bukan satu artikel.
function buildListSchema(items) {
  if (items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Portofolio Pixelso',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/portfolio/${item.slug}`,
      name: item.title,
    })),
  };
}

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoadError(false);
    portfolioService
      .getItems()
      .then(({ data }) => setItems(data || []))
      .catch(() => {
        setItems([]);
        setLoadError(true);
      })
      .finally(() => setLoaded(true));
  }, []);

  const listSchema = buildListSchema(items);

  return (
    <div className="section container">
      <Seo
        title="Portofolio"
        description="Contoh hasil cetak Pixelso Gemolong: banner, stiker, DTF, dan kebutuhan promosi lain untuk sekolah, UMKM, dan komunitas di Sragen."
        path="/portfolio"
        image={items[0]?.images?.[0]}
      />
      {listSchema && <JsonLd id="portfolio-list" data={listSchema} />}

      <div className="section-head">
        <h1>Portofolio</h1>
        <p className="text-muted">
          Contoh pekerjaan yang pernah kami kerjakan - lengkap dengan ukuran, bahan, dan proses
          pengerjaannya.
        </p>
      </div>

      {!loaded && (
        <p className="text-muted" role="status">Memuat portofolio...</p>
      )}

      {loaded && loadError && (
        <div className="alert alert-error" role="alert">
          Portofolio belum dapat dimuat karena layanan sedang bermasalah. Silakan coba lagi beberapa saat.
        </div>
      )}

      {loaded && !loadError && items.length === 0 && (
        <div className="card" style={{ maxWidth: 640, textAlign: 'center' }}>
          <h3>Segera Hadir</h3>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>
            Kami sedang menyiapkan dokumentasi hasil pekerjaan untuk ditampilkan di sini.
            Sementara itu, silakan lihat katalog produk kami.
          </p>
          <Link to="/katalog" className="btn btn-primary">Lihat Katalog</Link>
        </div>
      )}

      {!loadError && items.length > 0 && (
        <div className="grid grid-4 product-grid">
          {items.map((item) => (
            <Link
              key={item.slug}
              to={`/portfolio/${item.slug}`}
              className="card product-card"
              style={{ textDecoration: 'none' }}
            >
              {item.images?.[0] ? (
                <div className="product-thumb">
                  <img
                    src={item.images[0]}
                    alt={`${item.title}${item.location ? ` di ${item.location}` : ''} - hasil cetak Pixelso Gemolong`}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div className="product-thumb">{item.title.charAt(0)}</div>
              )}
              <div className="product-card-body">
                <h2 style={{ fontSize: '1rem', margin: 0 }}>{item.title}</h2>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
                  {[item.category, item.size].filter(Boolean).join(' - ')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
