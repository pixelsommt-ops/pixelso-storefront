import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCatalogStore from '../store/catalogStore';
import Seo from '../components/Seo';

// Halaman tab "Kategori" di bottom nav mobile - marketplace-style, ubin kategori
// yang tap ke Katalog dengan filter ?kategori=. Data sama dengan yang dipakai SubNav
// (dropdown kategori desktop), jadi otomatis konsisten.
export default function Kategori() {
  const products = useCatalogStore((s) => s.products);
  const fetchCatalog = useCatalogStore((s) => s.fetchCatalog);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const byCategory = new Map();
  products
    .filter((p) => p.active)
    .forEach((p) => {
      const name = p.category || 'Lainnya';
      if (!byCategory.has(name)) byCategory.set(name, { count: 0, imageUrl: null });
      const entry = byCategory.get(name);
      entry.count += 1;
      if (!entry.imageUrl && p.imageUrl) entry.imageUrl = p.imageUrl;
    });

  const categories = Array.from(byCategory.entries());

  return (
    <div className="section container">
      <Seo title="Kategori Produk" description="Pilih kategori produk cetak Pixelso Gemolong: banner, stiker, kartu nama, mug, kaos, dan lainnya." path="/kategori" />
      <div className="section-head">
        <h1>Kategori</h1>
        <p className="text-muted section-head-desc">Pilih kategori untuk lihat produknya.</p>
      </div>
      {categories.length === 0 && <p className="text-muted">Belum ada produk.</p>}
      <div className="kategori-grid">
        {categories.map(([name, { count, imageUrl }]) => (
          <Link key={name} to={`/katalog?kategori=${encodeURIComponent(name)}`} className="kategori-tile">
            <span className="kategori-tile-icon">
              {imageUrl ? <img src={imageUrl} alt={name} loading="lazy" /> : name.charAt(0)}
            </span>
            <span>{name}</span>
            <span className="text-muted" style={{ fontSize: '0.7rem' }}>{count} produk</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
