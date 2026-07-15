import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Login() {
  const login = useAuthStore((s) => s.login);
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

  return (
    <div className="section container" style={{ maxWidth: 420 }}>
      <h1>Masuk</h1>
      <form onSubmit={handleSubmit} className="card">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="field">
          <label>Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
          {submitting ? 'Memproses...' : 'Masuk'}
        </button>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 14 }}>
          Belum punya akun? <Link to="/daftar">Daftar di sini</Link>
        </p>
      </form>
    </div>
  );
}
