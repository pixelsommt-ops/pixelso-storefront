import { useMemo, useState } from 'react';
import { calculatePaperCut, SHEET_PRESETS } from '../lib/papercutCalculator';

const EMPTY = { sheetW: 32, sheetH: 47, pieceW: 9, pieceH: 5.5, margin: 0.5, gap: 0.2, quantity: 1000 };
const MAX_PREVIEW_CELLS = 144;

export default function PapercutCalculator() {
  const [form, setForm] = useState(EMPTY);

  const result = useMemo(() => calculatePaperCut(form), [form]);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const applyPreset = (preset) => setForm({ ...form, sheetW: preset.w, sheetH: preset.h });

  const previewCells = result.best.cols * result.best.rows;
  const showPreview = previewCells > 0 && previewCells <= MAX_PREVIEW_CELLS;

  return (
    <div className="section container">
      <div className="section-head">
        <h1>Kalkulator Papercut</h1>
        <p className="text-muted">
          Hitung berapa potongan hasil jadi yang muat dari satu lembar bahan, lengkap dengan kebutuhan jumlah lembar.
          Sistem otomatis mencoba orientasi normal dan diputar 90° lalu memilih yang paling efisien.
        </p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Ukuran Bahan &amp; Hasil Potong</h3>
          <div className="grid grid-2">
            <div className="field">
              <label>Lebar Bahan (cm)</label>
              <input type="number" min="1" step="0.1" value={form.sheetW} onChange={update('sheetW')} />
            </div>
            <div className="field">
              <label>Tinggi Bahan (cm)</label>
              <input type="number" min="1" step="0.1" value={form.sheetH} onChange={update('sheetH')} />
            </div>
          </div>
          <div className="field">
            <label>Preset Ukuran Bahan</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SHEET_PRESETS.map((preset) => (
                <button key={preset.label} type="button" className="btn btn-sm btn-secondary" onClick={() => applyPreset(preset)}>
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label>Lebar Hasil Jadi (cm)</label>
              <input type="number" min="0.1" step="0.1" value={form.pieceW} onChange={update('pieceW')} />
            </div>
            <div className="field">
              <label>Tinggi Hasil Jadi (cm)</label>
              <input type="number" min="0.1" step="0.1" value={form.pieceH} onChange={update('pieceH')} />
            </div>
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label>Margin Tepi (cm)</label>
              <input type="number" min="0" step="0.1" value={form.margin} onChange={update('margin')} />
            </div>
            <div className="field">
              <label>Jarak Antar Potong (cm)</label>
              <input type="number" min="0" step="0.1" value={form.gap} onChange={update('gap')} />
            </div>
          </div>
          <div className="field">
            <label>Jumlah Produk yang Dibutuhkan</label>
            <input type="number" min="1" step="1" value={form.quantity} onChange={update('quantity')} />
          </div>
        </div>

        <div className="card">
          <span className="eyebrow" style={{ margin: 0 }}>Hasil Paling Efisien</span>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--maroon-900)', margin: '6px 0' }}>
            {result.piecesPerSheet} pcs
          </div>
          <p className="text-muted" style={{ marginTop: 0 }}>maksimal per lembar bahan</p>

          <div className="grid grid-2" style={{ marginBottom: 16 }}>
            <div className="alert" style={{ background: 'var(--red-100)' }}>
              <div className="text-muted" style={{ fontSize: '0.78rem' }}>Kebutuhan Lembar</div>
              <strong>{result.sheetsNeeded} lembar</strong>
            </div>
            <div className="alert" style={{ background: 'var(--red-100)' }}>
              <div className="text-muted" style={{ fontSize: '0.78rem' }}>Orientasi Terbaik</div>
              <strong>{result.orientation === 'rotated' ? 'Diputar 90°' : 'Normal'}</strong>
            </div>
            <div className="alert" style={{ background: 'var(--red-100)' }}>
              <div className="text-muted" style={{ fontSize: '0.78rem' }}>Susunan</div>
              <strong>{result.best.cols} × {result.best.rows}</strong>
            </div>
            <div className="alert" style={{ background: 'var(--red-100)' }}>
              <div className="text-muted" style={{ fontSize: '0.78rem' }}>Efisiensi Area</div>
              <strong>{result.best.efficiency.toFixed(1)}%</strong>
            </div>
          </div>

          {showPreview ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${result.best.cols}, 1fr)`,
                gap: 3,
                border: '1px solid var(--line)',
                borderRadius: 8,
                padding: 8,
                maxWidth: 260,
              }}
              aria-label="Pratinjau susunan potongan"
            >
              {Array.from({ length: previewCells }).map((_, i) => (
                <div key={i} style={{ background: 'var(--red-500)', opacity: 0.75, aspectRatio: '1 / 1', borderRadius: 2 }} />
              ))}
            </div>
          ) : (
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>
              {previewCells === 0 ? 'Masukkan ukuran untuk melihat rekomendasi susunan.' : 'Susunan terlalu rapat untuk ditampilkan sebagai pratinjau visual.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
