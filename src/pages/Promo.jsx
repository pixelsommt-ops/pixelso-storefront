import { useEffect, useState } from 'react';
import * as promoService from '../services/promoService';
import Seo from '../components/Seo';

function formatDate(value) {
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Promo() {
  const [promos, setPromos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    promoService.getPromos().then(({ data }) => setPromos(data)).catch(() => setError('Gagal memuat promo'));
  }, []);

  return (
    <div className="section container">
      <Seo title="Promo" description="Penawaran spesial yang lagi berlaku di Pixelso Gemolong." path="/promo" />
      <div className="section-head">
        <h1>Promo</h1>
        <p className="text-muted">Penawaran spesial yang lagi berlaku di Pixelso.</p>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {!promos && !error && <p className="text-muted">Memuat promo...</p>}
      {promos && promos.length === 0 && <p className="text-muted">Belum ada promo aktif saat ini. Pantau terus ya!</p>}
      <div className="grid grid-4 product-grid">
        {promos?.map((promo) => (
          <div key={promo.id} className="card product-card">
            {promo.imageUrl ? (
              <img
                src={promo.imageUrl}
                alt={promo.title}
                loading="lazy"
                style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: '3px', display: 'block' }}
              />
            ) : (
              <div className="product-thumb" />
            )}
            <div className="product-card-body">
              <h3 style={{ marginTop: 0 }}>{promo.title}</h3>
              {promo.description && <p className="text-muted">{promo.description}</p>}
              {promo.endDate && (
                <span className="badge badge-muted">Berlaku s/d {formatDate(promo.endDate)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
