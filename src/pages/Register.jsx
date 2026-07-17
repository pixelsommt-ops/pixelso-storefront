import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import PasswordField from '../components/PasswordField';
import GoogleLoginButton from '../components/GoogleLoginButton';

const GOOGLE_ENABLED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

export default function Register() {
  const register = useAuthStore((s) => s.register);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/pesanan');
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal mendaftar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleToken = useCallback(
    async (idToken) => {
      setError('');
      try {
        await loginWithGoogle(idToken);
        navigate('/pesanan');
      } catch (err) {
        setError(err?.response?.data?.message || 'Gagal daftar dengan Google');
      }
    },
    [loginWithGoogle, navigate]
  );

  return (
    <div className="section container" style={{ maxWidth: 420 }}>
      <h1>Daftar Akun</h1>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}

        {GOOGLE_ENABLED && (
          <>
            <GoogleLoginButton onToken={handleGoogleToken} onError={setError} />
            <div className="auth-divider">
              <span>atau daftar dengan email</span>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nama Lengkap</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label>No. WhatsApp</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="field">
            <label>Password</label>
            <PasswordField
              required
              minLength={6}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Memproses...' : 'Daftar'}
          </button>
        </form>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 14 }}>
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
