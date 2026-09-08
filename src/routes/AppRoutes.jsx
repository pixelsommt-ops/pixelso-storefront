import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import StorefrontLayout from '../layouts/StorefrontLayout';
import ProtectedRoute from './ProtectedRoute';

// Home tetap eager (halaman pertama buat mayoritas pengunjung, lazy-load-nya cuma nambah 1
// round-trip network tanpa manfaat nyata). Semua page lain lazy - sebelumnya SEMUA halaman
// (termasuk checkout/login/admin-ish routes) masuk 1 bundle JS, padahal pengunjung baru cuma
// butuh kode Home utk render pertama kali.
import Home from '../pages/Home';

const PapercutCalculator = lazy(() => import('../pages/PapercutCalculator'));
const Catalog = lazy(() => import('../pages/Catalog'));
const Kategori = lazy(() => import('../pages/Kategori'));
const Profil = lazy(() => import('../pages/Profil'));
const Promo = lazy(() => import('../pages/Promo'));
const JamLayanan = lazy(() => import('../pages/JamLayanan'));
const TentangKami = lazy(() => import('../pages/TentangKami'));
const Blog = lazy(() => import('../pages/Blog'));
const BlogDetail = lazy(() => import('../pages/BlogDetail'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const Cart = lazy(() => import('../pages/Cart'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const Checkout = lazy(() => import('../pages/Checkout'));
const Orders = lazy(() => import('../pages/Orders'));
const OrderDetail = lazy(() => import('../pages/OrderDetail'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center' }}>Memuat...</div>}>
      <Routes>
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/katalog" element={<Catalog />} />
          <Route path="/kategori" element={<Kategori />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/promo" element={<Promo />} />
          <Route path="/jam-layanan" element={<JamLayanan />} />
          <Route path="/tentang-kami" element={<TentangKami />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/kalkulator-papercut" element={<PapercutCalculator />} />
          <Route path="/produk/:productKey" element={<ProductDetail />} />
          <Route path="/keranjang" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/daftar" element={<Register />} />
          <Route path="/lupa-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pesanan" element={<Orders />} />
            <Route path="/pesanan/:poId" element={<OrderDetail />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
