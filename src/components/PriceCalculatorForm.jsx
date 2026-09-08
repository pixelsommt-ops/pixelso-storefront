import { useEffect, useMemo, useState } from 'react';
import { calculatePrintPrice } from '../lib/calculator';
import { formatCurrency } from '../lib/format';

const EMPTY_FORM = { width: '', height: '', quantity: 1, needDesign: false };

// Grup opsi produk (Bahan, Laminasi, dst) beda-beda tiap produk - pilih default-nya dulu
// (choice isDefault, atau pilihan pertama kalau tidak ada yang ditandai default).
function buildDefaultSelections(product) {
  const selections = {};
  (product.optionGroups || []).forEach((group) => {
    const defaultChoice = group.choices.find((c) => c.isDefault) || group.choices[0];
    if (defaultChoice) selections[group.id] = defaultChoice.id;
  });
  return selections;
}

export default function PriceCalculatorForm({ catalog, product, onAddToCart }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [selections, setSelections] = useState(() => buildDefaultSelections(product));

  // Reset form & pilihan default tiap ganti produk (ProductDetail tidak remount saat
  // customer pindah dari satu produk ke produk lain lewat link, cuma productKey berubah).
  useEffect(() => {
    setForm(EMPTY_FORM);
    setSelections(buildDefaultSelections(product));
  }, [product.key]);

  const result = useMemo(
    () => calculatePrintPrice(catalog, { ...form, selections, productKey: product.key }),
    [catalog, form, selections, product.key]
  );

  const isAreaMode = (product.calcType || product.mode) === 'area';
  const optionGroups = product.optionGroups || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!result.valid) return;
    onAddToCart({
      productKey: product.key,
      productName: product.name,
      category: product.category,
      mode: product.mode,
      unitLabel: product.unitLabel,
      width: isAreaMode ? Number(form.width) : 0,
      height: isAreaMode ? Number(form.height) : 0,
      quantity: Number(form.quantity),
      selections,
      needDesign: form.needDesign,
      estimatedTotal: result.valid ? result.total : 0,
    });
    setForm(EMPTY_FORM);
    setSelections(buildDefaultSelections(product));
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 style={{ marginTop: 0 }}>Form Order</h3>
      {isAreaMode && (
        <div className="grid grid-2">
          <div className="field">
            <label>Lebar (cm)</label>
            <input
              type="number" min="1" required
              value={form.width}
              onChange={(e) => setForm({ ...form, width: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Tinggi (cm)</label>
            <input
              type="number" min="1" required
              value={form.height}
              onChange={(e) => setForm({ ...form, height: e.target.value })}
            />
          </div>
        </div>
      )}
      <div className="field">
        {/* inputLabel dari Master Mode Harga cuma berlaku buat mode non-area (mis. "Durasi (menit)"
            menggantikan field ini sepenuhnya) - mode area sudah punya Lebar/Tinggi sendiri di atas,
            field ini di situ artinya "berapa banyak ukuran segini", jadi tetap label generik. */}
        <label>{isAreaMode ? 'Jumlah (pcs)' : (product.inputLabel || 'Jumlah (pcs)')}</label>
        <input
          type="number" min="1" required
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />
      </div>

      {optionGroups.map((group) => (
        <div className="field" key={group.id}>
          <label>{group.label}{group.required ? ' *' : ''}</label>
          <select
            required={group.required}
            value={selections[group.id] || ''}
            onChange={(e) => setSelections({ ...selections, [group.id]: Number(e.target.value) })}
          >
            {!group.required && <option value="">Tidak dipilih</option>}
            {group.choices.map((choice) => (
              <option key={choice.id} value={choice.id}>{choice.label}</option>
            ))}
          </select>
        </div>
      ))}

      <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox" id="needDesign" style={{ width: 'auto' }}
          checked={form.needDesign}
          onChange={(e) => setForm({ ...form, needDesign: e.target.checked })}
        />
        <label htmlFor="needDesign" style={{ margin: 0 }}>
          Butuh bantuan desain (+{formatCurrency(catalog.designFee)})
        </label>
      </div>

      <div className="alert" style={{ background: 'var(--red-100)' }}>
        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Estimasi harga</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--maroon-900)' }}>
          {result.valid ? formatCurrency(result.total) : '-'}
        </div>
        {!result.valid && <div style={{ color: '#9b1530', fontSize: '0.8rem' }}>{result.message}</div>}
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={!result.valid}>
        Tambah ke Keranjang
      </button>
    </form>
  );
}
