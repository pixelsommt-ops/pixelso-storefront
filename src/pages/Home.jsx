import { useEffect, useState } from 'react';
import useCatalogStore from '../store/catalogStore';
import useInfiniteReveal from '../hooks/useInfiniteReveal';
import { getHomeVariant } from '../lib/experiment';
import HomeHero from './HomeHero';
import HomeEcommerce from './HomeEcommerce';

// Beranda A/B test (2026-07-30) - variant ditentukan sekali per pengunjung lewat
// getHomeVariant() (lib/experiment.js), lalu tetap sama tiap kunjungan berikutnya. Lihat hasil
// di ERP > Hasil Eksperimen. Data katalog dipusatkan di sini (bukan di masing-masing variant)
// supaya tidak fetch dobel + tidak reset infinite-reveal saat ganti variant.
export default function Home() {
  const products = useCatalogStore((s) => s.products);
  const fetchCatalog = useCatalogStore((s) => s.fetchCatalog);
  const [variant] = useState(() => getHomeVariant());

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const activeProducts = products.filter((p) => p.active);
  const { visibleCount, sentinelRef } = useInfiniteReveal(activeProducts.length, 10);
  const visibleProducts = activeProducts.slice(0, visibleCount);

  return variant === 'ecommerce' ? (
    <HomeEcommerce activeProducts={activeProducts} visibleProducts={visibleProducts} sentinelRef={sentinelRef} />
  ) : (
    <HomeHero visibleProducts={visibleProducts} sentinelRef={sentinelRef} />
  );
}
