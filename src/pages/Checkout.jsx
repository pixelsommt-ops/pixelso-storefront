import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as catalogService from '../services/catalogService';
import * as checkoutService from '../services/checkoutService';
import useCartStore from '../store/cartStore';
import { calculatePrintPrice } from '../lib/calculator';
import { formatCurrency } from '../lib/format';
import { waLink } from '../lib/business';
import FileUploadField from '../components/FileUploadField';
import useSiteSettingsStore from '../store/siteSettingsStore';

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Transfer Bank' },
  { value: 'qris', label: 'QRIS' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const business = useSiteSettingsStore((s) => s.settings);

  const [catalog, setCatalog] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentProofUrl, setPaymentProofUrl] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    catalogService.getCatalog().then(({ data }) => setCatalog(data));
  }, []);

  useEffect(() => {
    if (items.length === 0) navigate('/keranjang');
  }, [items.length, navigate]);

  const priced = useMemo(() => {
    if (!catalog) return [];
    return items.map((item) => ({ item, result: calculatePrintPrice(catalog, item) }));
  }, [catalog, items]);

  const total = priced.reduce((sum, { result }) => sum + (result.valid ? result.total : 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!paymentProofUrl) {
      setError('Bukti pembayaran wajib diunggah sebelum checkout.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await checkoutService.checkout({
        items: items.map((item) => ({
          productKey: item.productKey,
          width: item.width,
          height: item.height,
          quantity: item.quantity,
          selections: item.selections,
          needDesign: item.needDesign,
          fileUrl: item.fileUrl || null,
          designLink: item.designLink || null,
          specNote: item.specNote || null,
        })),
        paymentMethod,
        paymentProofUrl,
        notes,
      });
      clearCart();
      navigate(`/pesanan/${data.poId}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal checkout, coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="section container">
      <h1>Checkout</h1>
      <form onSubmit={handleSubmit} className="grid grid-2">
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3>Review Pesanan</h3>
            {priced.map(({ item, result }) => (
              <div key={item.cartItemId} style={{ borderBottom: '1px solid var(--line)', padding: '10px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{item.productName}</strong>
                  <span>{result.valid ? formatCurrency(result.total) : '-'}</span>
                </div>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: '4px 0' }}>
                  {item.mode === 'area' ? `${item.width}x${item.height}cm, ` : ''}{item.quantity} pcs
                </p>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: '4px 0' }}>
                  Desain:{' '}
                  {item.fileUrl ? (
                    <span style={{ color: 'var(--success)' }}>File terunggah ✓</span>
                  ) : item.designLink ? (
                    <a href={item.designLink} target="_blank" rel="noreferrer">Link desain ✓</a>
                  ) : (
                    <span>Belum ada, kirim menyusul via WhatsApp {business.whatsapp}</span>
                  )}
                </p>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, marginTop: 10 }}>
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="field">
            <label>Catatan (opsional)</label>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Mis. ambil di toko, warna dominan, dll." />
          </div>
        </div>

        <div>
          <div className="card">
            <h3>Pembayaran</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              Transfer sejumlah <strong>{formatCurrency(total)}</strong> lalu upload bukti transfer di bawah ini.
              Tim kami akan verifikasi manual.
            </p>
            <div className="field">
              <label>Metode Pembayaran</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <FileUploadField
              kind="proof"
              label="Bukti Transfer"
              required
              helpText="Foto/screenshot bukti transfer, format JPG/PNG/WebP."
              value={paymentProofUrl}
              onUploaded={setPaymentProofUrl}
            />
            {error && <div className="alert alert-error">{error}</div>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Memproses...' : 'Selesaikan Pesanan'}
            </button>
            <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: 10 }}>
              Ada pertanyaan?{' '}
              <a href={waLink(business.whatsapp, 'Halo Pixelso, saya mau tanya soal checkout.')} target="_blank" rel="noreferrer">
                Chat WhatsApp
              </a>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
