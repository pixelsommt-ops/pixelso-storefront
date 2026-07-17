import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as authService from '../services/authService';

const PASSWORD_RESET_ENABLED = import.meta.env.VITE_PASSWORD_RESET_ENABLED !== 'false';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!PASSWORD_RESET_ENABLED) {
    return (
      <div className="section container" style={{ maxWidth: 420 }}>
        <h1>Lupa Password</h1>
        <div className="card">
          <p>Fitur reset password mandiri belum aktif. Silakan hubungi kami lewat WhatsApp untuk bantuan reset password.</p>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 14 }}>
            <Link to="/login">Kembali ke halaman masuk</Link>
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal mengirim link reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section container" style={{ maxWidth: 420 }}>
      <h1>Lupa Password</h1>
      <div className="card">
        {sent ? (
          <>
            <p>Kalau email <strong>{email}</strong> terdaftar, link reset password sudah kami kirim. Cek inbox (dan folder spam) ya.</p>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 14 }}>
              <Link to="/login">Kembali ke halaman masuk</Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 14 }}>
              Masukkan email akun Anda, kami akan kirim link untuk membuat password baru.
            </p>
            <div className="field">
              <label>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 14 }}>
              <Link to="/login">Kembali ke halaman masuk</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
