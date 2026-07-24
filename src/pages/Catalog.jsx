import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as catalogService from '../services/catalogService';
import ProductCard from '../components/ProductCard';
import useInfiniteReveal from '../hooks/useInfiniteReveal';

export default function Catalog() {
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const kategori = searchParams.get('kategori') || '';

  useEffect(() => {
    catalogService.getCatalog().then(({ data }) => setCatalog(data)).catch(() => setError('Gagal memuat katalog'));
  }, []);

  const products = (catalog?.products || []).filter((p) => {
    if (!p.active) return false;
    if (kategori && (p.category || 'Lainnya') !== kategori) return false;
    if (!query) return true;
    const haystack = `${p.name} ${p.description || ''}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const { visibleCount, sentinelRef } = useInfiniteReveal(products.length, 10);
  const visibleProducts = products.slice(0, visibleCount);

  return (
    <div className="section container">
      <div className="section-head">
        <h1>{kategori || 'Katalog Produk'}</h1>
        {query ? (
          <p className="text-muted section-head-desc">
            Hasil pencarian untuk &quot;{query}&quot; ({products.length} produk).{' '}
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setSearchParams(kategori ? { kategori } : {})}>
              Hapus pencarian
            </button>
          </p>
        ) : kategori ? (
          <p className="text-muted section-head-desc">
            {products.length} produk.{' '}
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setSearchParams({})}>
              Semua kategori
            </button>
          </p>
        ) : (
          <p className="text-muted section-head-desc">Pilih produk untuk lihat kalkulator harga dan tambahkan ke keranjang.</p>
        )}
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {!catalog && !error && <p className="text-muted">Memuat katalog...</p>}
      {catalog && query && products.length === 0 && (
        <div className="alert" style={{ background: 'var(--red-100)' }}>
          Tidak ada produk yang cocok dengan &quot;{query}&quot;. Coba kata kunci lain, atau hubungi kami lewat WhatsApp.
        </div>
      )}
      <div className="grid grid-4 product-grid">
        {visibleProducts.map((p) => (
          <ProductCard key={p.key} product={p} />
        ))}
      </div>
      <div ref={sentinelRef} />
    </div>
  );
}
