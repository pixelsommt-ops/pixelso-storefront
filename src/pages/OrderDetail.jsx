import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as ordersService from '../services/ordersService';
import { formatCurrency, formatDateTime } from '../lib/format';

const PAYMENT_STATUS_LABEL = {
  pending: 'Menunggu Verifikasi',
  confirmed: 'Terverifikasi',
  rejected: 'Ditolak',
};

export default function OrderDetail() {
  const { poId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    ordersService.getById(poId).then(({ data }) => setOrder(data)).catch(() => setError('Pesanan tidak ditemukan'));
  }, [poId]);

  if (error) return <div className="section container"><div className="alert alert-error">{error}</div></div>;
  if (!order) return <div className="section container"><p className="text-muted">Memuat...</p></div>;

  const payment = order.salesPos?.payments?.[0];

  return (
    <div className="section container">
      <div className="section-head">
        <h1>{order.poNumber}</h1>
        <span className="badge badge-warning">{order.statusLabel}</span>
        <p className="text-muted">Dibuat {formatDateTime(order.createdAt)}</p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Item Pesanan</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Produk</th><th>Ukuran/Qty</th><th>Desain</th><th>Harga</th></tr>
            </thead>
            <tbody>
              {order.poDetails.map((d) => (
                <tr key={d.poDetailId}>
                  <td>{d.product?.printProduct?.name || d.product?.name}</td>
                  <td>{d.size} &times; {d.qty}</td>
                  <td>{d.fileUrl ? <a href={d.fileUrl} target="_blank" rel="noreferrer">Lihat file</a> : '-'}</td>
                  <td>{formatCurrency(d.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {order.salesPos && (
        <div className="card">
          <h3>Pembayaran</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>Total</span>
            <strong>{formatCurrency(order.salesPos.total)}</strong>
          </div>
          {payment && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Status Bukti Transfer</span>
                <span className={`badge ${payment.status === 'confirmed' ? 'badge-success' : payment.status === 'rejected' ? 'badge-error' : 'badge-warning'}`}>
                  {PAYMENT_STATUS_LABEL[payment.status] || payment.status}
                </span>
              </div>
              {payment.proofUrl && (
                <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary">
                  Lihat Bukti Transfer
                </a>
              )}
            </>
          )}
        </div>
      )}

      {order.notes && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Catatan</h3>
          <p className="text-muted">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
