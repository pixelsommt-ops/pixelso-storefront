import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as ordersService from '../services/ordersService';
import OrderKanbanBoard from '../components/OrderKanbanBoard';
import { formatCurrency, formatDateTime } from '../lib/format';

const STATUS_BADGE = {
  'Menunggu Konfirmasi': 'badge-muted',
  'Menunggu Verifikasi Pembayaran': 'badge-warning',
  'Sedang Diproses': 'badge-warning',
  'Sedang Dicetak': 'badge-warning',
  'Sedang Diperiksa': 'badge-warning',
  'Siap Diambil/Dikirim': 'badge-success',
  Selesai: 'badge-success',
  Ditunda: 'badge-muted',
  'Sedang Ditinjau': 'badge-muted',
};

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('pesanan_view_mode') || 'kanban');
  const setView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('pesanan_view_mode', mode);
  };

  useEffect(() => {
    ordersService.list().then(({ data }) => setOrders(data)).catch(() => setError('Gagal memuat pesanan'));
  }, []);

  return (
    <div className="section container">
      <div className="section-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h1>Pesanan Saya</h1>
        {orders && orders.length > 0 && (
          <div style={{ display: 'flex', gap: 8 }} role="group" aria-label="Tampilan">
            <button type="button" className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('kanban')}>
              Papan Kanban
            </button>
            <button type="button" className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('table')}>
              Tabel
            </button>
          </div>
        )}
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {!orders && !error && <p className="text-muted">Memuat...</p>}
      {orders && orders.length === 0 && <p className="text-muted">Belum ada pesanan.</p>}

      {orders && orders.length > 0 && viewMode === 'kanban' && <OrderKanbanBoard orders={orders} />}

      {orders && orders.length > 0 && viewMode === 'table' && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>No. Pesanan</th><th>Tanggal</th><th>Status</th><th>Total</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.poId}>
                  <td>{o.poNumber}</td>
                  <td>{formatDateTime(o.createdAt)}</td>
                  <td><span className={`badge ${STATUS_BADGE[o.statusLabel] || 'badge-muted'}`}>{o.statusLabel}</span></td>
                  <td>{formatCurrency(o.total)}</td>
                  <td><Link to={`/pesanan/${o.poId}`} className="btn btn-sm btn-secondary">Detail</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
