import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as catalogService from '../services/catalogService';
import useCartStore from '../store/cartStore';
import { calculatePrintPrice } from '../lib/calculator';
import { formatCurrency } from '../lib/format';

export default function Cart() {
  const [catalog, setCatalog] = useState(null);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const navigate = useNavigate();

  useEffect(() => {
    catalogService.getCatalog().then(({ data }) => setCatalog(data));
  }, []);

  const priced = useMemo(() => {
    if (!catalog) return [];
    return items.map((item) => ({ item, result: calculatePrintPrice(catalog, item) }));
  }, [catalog, items]);

  const subtotal = priced.reduce((sum, { result }) => sum + (result.valid ? result.total : 0), 0);

  if (items.length === 0) {
    return (
      <div className="section container">
        <h1>Keranjang Kosong</h1>
        <p className="text-muted">Belum ada item. Yuk lihat katalog produk.</p>
        <Link to="/katalog" className="btn btn-primary">Lihat Katalog</Link>
      </div>
    );
  }

  return (
    <div className="section container">
      <h1>Keranjang</h1>
      {!catalog && <p className="text-muted">Memuat harga...</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Produk</th>
              <th>Ukuran/Qty</th>
              <th>Opsi</th>
              <th>Harga</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {priced.map(({ item, result }) => (
              <tr key={item.cartItemId}>
                <td>{item.productName}{item.needDesign && <div className="badge badge-muted">+ Bantuan Desain</div>}</td>
                <td>{item.mode === 'area' ? `${item.width}x${item.height}cm` : '-'} &times; {item.quantity} pcs</td>
                <td>{(result.selectedOptionsSnapshot || []).map((o) => o.choiceLabel).join(', ') || '-'}</td>
                <td>{result.valid ? formatCurrency(result.total) : '-'}</td>
                <td>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => removeItem(item.cartItemId)}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ maxWidth: 360, marginLeft: 'auto', marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 14 }}
          onClick={() => navigate('/checkout')}
        >
          Lanjut ke Checkout
        </button>
      </div>
    </div>
  );
}
