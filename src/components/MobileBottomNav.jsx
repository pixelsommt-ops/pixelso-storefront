import { NavLink } from 'react-router-dom';
import { HomeIcon, PromoIcon, KategoriIcon, ProfilIcon, KalkulatorIcon, BlogIcon } from './BottomNavIcons';

// Tab bar bawah, gaya marketplace (Shopee/Tokopedia) - cuma tampil di layar mobile,
// lihat aturan CSS ".bottom-nav" di index.css. Desktop/tablet pakai nav atas seperti biasa.
export default function MobileBottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      <NavLink to="/" end className={({ isActive }) => `bottom-nav-link${isActive ? ' active' : ''}`}>
        <HomeIcon />
        <span>Beranda</span>
      </NavLink>
      <NavLink to="/blog" className={({ isActive }) => `bottom-nav-link${isActive ? ' active' : ''}`}>
        <BlogIcon />
        <span>Blog</span>
      </NavLink>
      <NavLink to="/promo" className={({ isActive }) => `bottom-nav-link${isActive ? ' active' : ''}`}>
        <PromoIcon />
        <span>Promo</span>
      </NavLink>
      <NavLink to="/kategori" className={({ isActive }) => `bottom-nav-link${isActive ? ' active' : ''}`}>
        <KategoriIcon />
        <span>Kategori</span>
      </NavLink>
      <NavLink to="/profil" className={({ isActive }) => `bottom-nav-link${isActive ? ' active' : ''}`}>
        <ProfilIcon />
        <span>Profil</span>
      </NavLink>
      <NavLink to="/kalkulator-papercut" className={({ isActive }) => `bottom-nav-link${isActive ? ' active' : ''}`}>
        <KalkulatorIcon />
        <span>Kalkulator</span>
      </NavLink>
    </nav>
  );
}
