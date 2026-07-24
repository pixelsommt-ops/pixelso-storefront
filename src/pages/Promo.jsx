import { useEffect, useState } from 'react';
import * as promoService from '../services/promoService';

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
                style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
              />
            ) : (
              <div className="product-thumb" />
            )}
            <h3 style={{ marginTop: '0.75rem' }}>{promo.title}</h3>
            {promo.description && <p className="text-muted">{promo.description}</p>}
            {promo.endDate && (
              <span className="badge badge-muted">Berlaku s/d {formatDate(promo.endDate)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
