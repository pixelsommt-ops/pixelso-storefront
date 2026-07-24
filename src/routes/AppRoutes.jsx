import { Routes, Route } from 'react-router-dom';
import StorefrontLayout from '../layouts/StorefrontLayout';
import ProtectedRoute from './ProtectedRoute';

import Home from '../pages/Home';
import PapercutCalculator from '../pages/PapercutCalculator';
import Catalog from '../pages/Catalog';
import Kategori from '../pages/Kategori';
import Profil from '../pages/Profil';
import Promo from '../pages/Promo';
import JamLayanan from '../pages/JamLayanan';
import TentangKami from '../pages/TentangKami';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import OrderDetail from '../pages/OrderDetail';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/katalog" element={<Catalog />} />
        <Route path="/kategori" element={<Kategori />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/promo" element={<Promo />} />
        <Route path="/jam-layanan" element={<JamLayanan />} />
        <Route path="/tentang-kami" element={<TentangKami />} />
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
  );
}
