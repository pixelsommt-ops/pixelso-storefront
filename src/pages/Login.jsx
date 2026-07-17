import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import PasswordField from '../components/PasswordField';
import GoogleLoginButton from '../components/GoogleLoginButton';

const GOOGLE_ENABLED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
// Default nyala di dev; di production sengaja dimatikan lewat env sampai email pengirim
// link reset (GMAIL_USER/GMAIL_APP_PASSWORD) beres - lihat catatan di .env.example.
const PASSWORD_RESET_ENABLED = import.meta.env.VITE_PASSWORD_RESET_ENABLED !== 'false';

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate('/pesanan');
    } catch (err) {
      setError(err?.response?.data?.message || 'Email atau password salah');
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
        setError(err?.response?.data?.message || 'Gagal masuk dengan Google');
      }
    },
    [loginWithGoogle, navigate]
  );

  return (
    <div className="section container" style={{ maxWidth: 420 }}>
      <h1>Masuk</h1>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}

        {GOOGLE_ENABLED && (
          <>
            <GoogleLoginButton onToken={handleGoogleToken} onError={setError} />
            <div className="auth-divider">
              <span>atau masuk dengan email</span>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label>Password</label>
            <PasswordField
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {PASSWORD_RESET_ENABLED && (
              <p style={{ fontSize: '0.85rem', marginTop: 6 }}>
                <Link to="/lupa-password">Lupa password?</Link>
              </p>
            )}
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 14 }}>
          Belum punya akun? <Link to="/daftar">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}
