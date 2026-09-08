import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, productImageAlt } from '../lib/format';

const SCROLL_STEP = 300;

// Strip varian produk di bawah hero (gaya "Blue White / Tan White Gum / ..." pada referensi
// desain) - bukan varian warna (Pixelso tidak jual sepatu), tapi preview produk populer supaya
// pengunjung langsung lihat pilihan tanpa scroll ke grid "Produk Populer" di bawah.
export default function HeroProductStrip({ products }) {
  const trackRef = useRef(null);

  if (!products || products.length === 0) return null;

  const scroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir * SCROLL_STEP, behavior: 'smooth' });
  };

  return (
    <div className="hero-strip">
      <button type="button" className="hero-strip-arrow" onClick={() => scroll(-1)} aria-label="Sebelumnya">
        &#8249;
      </button>
      <div className="hero-strip-track" ref={trackRef}>
        {products.map((p) => (
          <Link key={p.key} to={`/produk/${p.key}`} className="hero-strip-item">
            <div className="hero-strip-thumb">
              {p.imageUrl ? <img src={p.imageUrl} alt={productImageAlt(p)} loading="lazy" /> : <span>{p.name.charAt(0)}</span>}
            </div>
            <p className="hero-strip-name">{p.name}</p>
            <p className="hero-strip-price">
              Mulai {formatCurrency(p.baseRate)}
              {p.discount && <span className="badge badge-discount" style={{ marginLeft: '0.35rem' }}>{p.discount.type === 'percent' ? `-${p.discount.value}%` : 'Diskon'}</span>}
            </p>
          </Link>
        ))}
      </div>
      <button type="button" className="hero-strip-arrow" onClick={() => scroll(1)} aria-label="Berikutnya">
        &#8250;
      </button>
    </div>
  );
}
