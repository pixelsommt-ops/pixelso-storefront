import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as authService from '../services/authService';
import PasswordField from '../components/PasswordField';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak sama');
      return;
    }
    setSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="section container" style={{ maxWidth: 420 }}>
        <h1>Reset Password</h1>
        <div className="card">
          <div className="alert alert-error">Link reset password tidak valid. Silakan minta link baru.</div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 14 }}>
            <Link to="/lupa-password">Minta link reset baru</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="section container" style={{ maxWidth: 420 }}>
      <h1>Buat Password Baru</h1>
      <div className="card">
        {done ? (
          <p>Password berhasil diubah. Mengarahkan ke halaman masuk...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="field">
              <label>Password Baru</label>
              <PasswordField
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Konfirmasi Password Baru</label>
              <PasswordField
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
