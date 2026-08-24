import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useCatalogStore from '../store/catalogStore';
import useSiteSettingsStore from '../store/siteSettingsStore';
import * as blogService from '../services/blogService';
import { waLink } from '../lib/business';
import { trackContact } from '../lib/analytics';
import { WhatsappIcon } from './SocialIcons';

// Badge "New" (2026-08-04) - dianggap baru kalau dibuat/tayang dalam N hari terakhir. SubNav
// hidup di layout (tampil di semua halaman), jadi pengecekannya di sini, bukan di halaman
// Katalog/Blog masing-masing yang cuma mount saat halaman itu sendiri dibuka.
const NEW_BADGE_MAX_AGE_DAYS = 7;
function isRecent(dateStr) {
  if (!dateStr) return false;
  const ageMs = Date.now() - new Date(dateStr).getTime();
  return ageMs >= 0 && ageMs <= NEW_BADGE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
}

function NewBadge() {
  return <span className="sub-nav-new-badge">New</span>;
}

export default function SubNav() {
  const products = useCatalogStore((s) => s.products);
  const fetchCatalog = useCatalogStore((s) => s.fetchCatalog);
  const business = useSiteSettingsStore((s) => s.settings);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [blogPosts, setBlogPosts] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    blogService.getPosts().then(({ data }) => setBlogPosts(data || [])).catch(() => setBlogPosts([]));
  }, []);

  const hasNewProduct = products.some((p) => p.active && isRecent(p.createdAt));
  const hasNewBlogPost = blogPosts.some((post) => isRecent(post.publishedAt));

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
        <div style={{ position: 'relative', flexShrink: 0 }}>
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

        {/* Wrapper terpisah supaya scroll horizontal di mobile (lihat .sub-nav-scroll)
            tidak ikut meng-clip dropdown kategori di atas - overflow-x:auto pada satu
            axis otomatis meng-clip axis lainnya juga kalau dipasang di kontainer yang sama. */}
        <div className="sub-nav-scroll">
          <NavLink to="/katalog" className="sub-nav-link" onClick={closeCategory}>
            Semua Produk
            {hasNewProduct && <NewBadge />}
          </NavLink>
          <NavLink to="/" className="sub-nav-link" onClick={closeCategory}>Beranda</NavLink>
          <NavLink to="/promo" className="sub-nav-link" onClick={closeCategory}>Promo</NavLink>
          <NavLink to="/jam-layanan" className="sub-nav-link" onClick={closeCategory}>Jam Layanan</NavLink>
          <NavLink to="/tentang-kami" className="sub-nav-link" onClick={closeCategory}>Tentang Kami</NavLink>
          <NavLink to="/blog" className="sub-nav-link" onClick={closeCategory}>
            Blog
            {hasNewBlogPost && <NewBadge />}
          </NavLink>
        </div>

        {business.whatsapp && (
          <a
            href={waLink(business.whatsapp, 'Halo Pixelso, saya butuh bantuan.')}
            target="_blank"
            rel="noreferrer"
            className="sub-nav-help"
            onClick={() => trackContact('sub_nav')}
          >
            <WhatsappIcon /> Pusat Bantuan
          </a>
        )}
      </div>
    </nav>
  );
}
