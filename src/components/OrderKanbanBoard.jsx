import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDateTime } from '../lib/format';

// Kolom = label status ramah pelanggan (lihat CUSTOMER_STATUS_LABELS di backend
// storefront.service.js), urut sesuai alur pesanan sebenarnya. Read-only - pelanggan cuma bisa
// melihat posisi pesanannya, tidak bisa menggeser (beda dari papan Kanban staf di ERP).
const COLUMNS = [
  'Menunggu Konfirmasi',
  'Menunggu Verifikasi Pembayaran',
  'Sedang Diproses',
  'Sedang Dicetak',
  'Sedang Diperiksa',
  'Siap Diambil/Dikirim',
  'Selesai',
];

// hold/complaint tetap ditaruh di kolom alur utamanya (columnLabel dari backend), badge kecil
// ini yang menandai pesanan sedang ditunda/ditinjau supaya pelanggan tetap tahu statusnya.
const EXCEPTION_LABELS = ['Ditunda', 'Sedang Ditinjau'];

export default function OrderKanbanBoard({ orders }) {
  const navigate = useNavigate();

  const grouped = COLUMNS.reduce((acc, label) => {
    acc[label] = [];
    return acc;
  }, {});
  orders.forEach((o) => {
    const key = grouped[o.columnLabel] ? o.columnLabel : 'Menunggu Konfirmasi';
    grouped[key].push(o);
  });

  return (
    <div className="order-kanban-board">
      {COLUMNS.map((label) => {
        const cards = grouped[label] || [];
        return (
          <div key={label} className="order-kanban-column">
            <div className="order-kanban-column-header">
              <span>{label}</span>
              <span className="order-kanban-column-count">{cards.length}</span>
            </div>
            <div className="order-kanban-column-body">
              {cards.map((o) => {
                const isException = EXCEPTION_LABELS.includes(o.statusLabel);
                return (
                  <div key={o.poId} className="order-kanban-card" onClick={() => navigate(`/pesanan/${o.poId}`)}>
                    <div className="order-kanban-card-top">
                      <strong>{o.poNumber}</strong>
                      {isException && <span className="badge badge-warning">{o.statusLabel}</span>}
                    </div>
                    <div className="order-kanban-card-meta">
                      <span>{formatDateTime(o.createdAt)}</span>
                      {o.total != null && <span>{formatCurrency(o.total)}</span>}
                    </div>
                  </div>
                );
              })}
              {cards.length === 0 && <div className="order-kanban-column-empty">Belum ada pesanan</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
