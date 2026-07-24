import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// Halaman tab "Profil" di bottom nav mobile - ringkas: identitas akun + pintasan
// Pesanan Saya kalau sudah login, atau ajakan Masuk/Daftar kalau belum.
export default function Profil() {
  const customer = useAuthStore((s) => s.customer);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="section container" style={{ maxWidth: 480 }}>
      <div className="section-head">
        <h1>Profil</h1>
      </div>

      {customer ? (
        <>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="profil-avatar">{customer.name.charAt(0).toUpperCase()}</span>
            <div>
              <p style={{ margin: 0, fontWeight: 800 }}>{customer.name}</p>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>{customer.email}</p>
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <Link to="/pesanan" className="profil-row">
              Pesanan Saya <span aria-hidden>›</span>
            </Link>
            <Link to="/keranjang" className="profil-row">
              Keranjang <span aria-hidden>›</span>
            </Link>
          </div>

          <button type="button" className="btn btn-secondary" style={{ width: '100%', marginTop: 16 }} onClick={handleLogout}>
            Keluar
          </button>
        </>
      ) : (
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="text-muted">Masuk untuk melihat pesanan dan checkout lebih cepat.</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <Link to="/login" className="btn btn-primary" style={{ flex: 1 }}>Masuk</Link>
            <Link to="/daftar" className="btn btn-secondary" style={{ flex: 1 }}>Daftar</Link>
          </div>
        </div>
      )}
    </div>
  );
}
