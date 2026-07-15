import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useCatalogStore from '../store/catalogStore';
import useSiteSettingsStore from '../store/siteSettingsStore';
import { waLink } from '../lib/business';
import { WhatsappIcon } from './SocialIcons';

export default function SubNav() {
  const products = useCatalogStore((s) => s.products);
  const fetchCatalog = useCatalogStore((s) => s.fetchCatalog);
  const business = useSiteSettingsStore((s) => s.settings);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => setCategoryOpen(false), [location.pathname]);

  const categories = [];
  const byCategory = new Map();
  products
    .filter((p) => p.active)
    .forEach((p) => {
      const name = p.category || 'Lainnya';
      if (!byCategory.has(name)) {
        byCategory.set(name, []);
        categories.push(name);
      }
      byCategory.get(name).push(p);
    });

  const closeCategory = () => setCategoryOpen(false);

  return (
    <nav className="sub-nav">
      <div className="container sub-nav-inner">
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="category-menu-btn"
            onClick={() => setCategoryOpen((v) => !v)}
            aria-expanded={categoryOpen}
          >
            ☰ Menu Kategori
          </button>
          {categoryOpen && (
            <div className="category-dropdown">
              {categories.length === 0 && <p className="text-muted">Belum ada produk.</p>}
              {categories.map((name) => (
                <div key={name} className="category-group">
                  <h4>{name}</h4>
                  {byCategory.get(name).map((p) => (
                    <NavLink key={p.key} to={`/produk/${p.key}`} onClick={closeCategory}>
                      {p.name}
                    </NavLink>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <NavLink to="/" className="sub-nav-link" onClick={closeCategory}>Beranda</NavLink>
        <NavLink to="/katalog" className="sub-nav-link" onClick={closeCategory}>Semua Produk</NavLink>
        <NavLink to="/promo" className="sub-nav-link" onClick={closeCategory}>Promo</NavLink>
        <NavLink to="/jam-layanan" className="sub-nav-link" onClick={closeCategory}>Jam Layanan</NavLink>
        <NavLink to="/tentang-kami" className="sub-nav-link" onClick={closeCategory}>Tentang Kami</NavLink>

        {business.whatsapp && (
          <a
            href={waLink(business.whatsapp, 'Halo Pixelso, saya butuh bantuan.')}
            target="_blank"
            rel="noreferrer"
            className="sub-nav-help"
          >
            <WhatsappIcon /> Pusat Bantuan
          </a>
        )}
      </div>
    </nav>
  );
}
