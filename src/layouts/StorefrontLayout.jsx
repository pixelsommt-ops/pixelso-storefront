import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import useSiteSettingsStore from '../store/siteSettingsStore';
import { waLink } from '../lib/business';
import { trackPageview, trackContact, captureUtmFromUrl } from '../lib/analytics';
import SearchBar from '../components/SearchBar';
import SubNav from '../components/SubNav';
import RichText from '../components/RichText';
import MobileBottomNav from '../components/MobileBottomNav';
import { CartIcon } from '../components/BottomNavIcons';
import { AddressIcon, InstagramIcon, TiktokIcon, YoutubeIcon, WhatsappIcon, ShopeeIcon } from '../components/SocialIcons';

export default function StorefrontLayout() {
  const customer = useAuthStore((s) => s.customer);
  const logout = useAuthStore((s) => s.logout);
  const cartCount = useCartStore((s) => s.items.length);
  const business = useSiteSettingsStore((s) => s.settings);
  const fetchSettings = useSiteSettingsStore((s) => s.fetchSettings);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Tutup menu burger otomatis tiap pindah halaman (mis. lewat tombol back/forward browser).
  useEffect(() => setMenuOpen(false), [location.pathname]);

  // GA4 tidak mendeteksi navigasi client-side React Router sebagai pageview baru (bukan full
  // page load) - lihat index.html (send_page_view: false), jadi dikirim manual di sini.
  useEffect(() => {
    captureUtmFromUrl(location.search);
    trackPageview(location.pathname + location.search);
  }, [location.pathname, location.search]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div>
      <header className="topbar">
        <div className="container topbar-inner">
          <NavLink to="/" className="brand">
            <img src={business.logoUrl || '/logo-pixelso-persegi.png'} alt={business.name} className="brand-logo" />
          </NavLink>
          <SearchBar />
          <NavLink to="/keranjang" className="mobile-cart-btn cart-badge" aria-label="Keranjang">
            <CartIcon />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </NavLink>
          <button
            type="button"
            className="burger-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Buka menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
          <nav className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
            <NavLink to="/katalog" onClick={closeMenu}>Katalog</NavLink>
            <NavLink to="/kalkulator-papercut" onClick={closeMenu}>Kalkulator Papercut</NavLink>
            {customer && <NavLink to="/pesanan" onClick={closeMenu}>Pesanan Saya</NavLink>}
            <NavLink to="/keranjang" className="cart-badge" onClick={closeMenu}>
              Keranjang
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </NavLink>
            {customer ? (
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => { closeMenu(); logout(); }}>
                Keluar ({customer.name.split(' ')[0]})
              </button>
            ) : (
              <NavLink to="/login" className="btn btn-sm btn-primary nav-cta" onClick={closeMenu}>
                Masuk
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <SubNav />

      <main>
        <Outlet />
      </main>

      <footer>
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3 style={{ color: '#fff' }}>{business.name}</h3>
              <RichText html={business.description} style={{ color: '#d9b9c1', maxWidth: 380 }} />
              <p style={{ color: '#d9b9c1', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                <AddressIcon style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                <span>{business.address}</span>
              </p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1rem' }}>Kontak</h3>
              {business.whatsapp && (
                <p>
                  <a
                    href={waLink(business.whatsapp, 'Halo Pixelso, saya mau tanya soal pemesanan.')}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    onClick={() => trackContact('footer')}
                  >
                    <WhatsappIcon /> {business.whatsapp}
                  </a>
                </p>
              )}
              {business.instagram && (
                <p>
                  <a
                    href={`https://instagram.com/${business.instagram}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <InstagramIcon /> @{business.instagram}
                  </a>
                </p>
              )}
              {business.tiktok && (
                <p>
                  <a
                    href={`https://tiktok.com/@${business.tiktok}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <TiktokIcon /> TikTok @{business.tiktok}
                  </a>
                </p>
              )}
              {business.youtube && (
                <p>
                  <a
                    href={`https://youtube.com/@${business.youtube}/shorts`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <YoutubeIcon /> YouTube Shorts @{business.youtube}
                  </a>
                </p>
              )}
              <p style={{ color: '#d9b9c1' }}>{business.openingHours}</p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1rem' }}>Belanja</h3>
              <p><NavLink to="/katalog">Katalog Produk</NavLink></p>
              <p><NavLink to="/kalkulator-papercut">Kalkulator Papercut</NavLink></p>
              <p><NavLink to="/keranjang">Keranjang</NavLink></p>
              {customer && <p><NavLink to="/pesanan">Pesanan Saya</NavLink></p>}
            </div>
          </div>
          <p style={{ color: '#b98d97', fontSize: '0.8rem', margin: 0 }}>
            &copy; {new Date().getFullYear()} {business.name}. Semua pesanan diproses lewat toko yang sama.
          </p>
        </div>
      </footer>

      <div className="social-float-stack">
        {business.googleMapsUrl && (
          <a
            href={business.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="social-float-btn social-float-btn-googlemaps"
            aria-label="Buka lokasi di Google Maps"
          >
            <AddressIcon />
          </a>
        )}
        {business.shopee && (
          <a
            href={business.shopee}
            target="_blank"
            rel="noreferrer"
            className="social-float-btn social-float-btn-shopee"
            aria-label="Kunjungi toko Shopee"
          >
            <ShopeeIcon />
          </a>
        )}
        {business.instagram && (
          <a
            href={`https://instagram.com/${business.instagram}`}
            target="_blank"
            rel="noreferrer"
            className="social-float-btn social-float-btn-instagram"
            aria-label="Kunjungi Instagram"
          >
            <InstagramIcon />
          </a>
        )}
        {business.tiktok && (
          <a
            href={`https://tiktok.com/@${business.tiktok}`}
            target="_blank"
            rel="noreferrer"
            className="social-float-btn social-float-btn-tiktok"
            aria-label="Kunjungi TikTok"
          >
            <TiktokIcon />
          </a>
        )}
        {business.whatsapp && (
          <a
            href={waLink(business.whatsapp, 'Halo Pixelso, saya mau tanya soal pemesanan.')}
            target="_blank"
            rel="noreferrer"
            className="wa-float-btn"
            aria-label="Chat WhatsApp"
            onClick={() => trackContact('floating_button')}
          >
            <WhatsappIcon />
          </a>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}
