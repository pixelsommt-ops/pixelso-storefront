import { useRef, useState } from 'react';
import { compressImage } from '../lib/compressImage';
import { readFileAsDataUrl } from '../lib/readFileAsDataUrl';
import * as uploadService from '../services/uploadService';

// Harus sinkron dengan allowedExtensions di
// ~/pixelso-erp/backend/src/common/utils/fileUpload.js (kind 'design').
const DESIGN_EXTENSIONS = ['pdf', 'ai', 'cdr', 'psd', 'jpg', 'jpeg', 'png', 'zip', 'rar', 'stl'];
const DESIGN_ACCEPT = DESIGN_EXTENSIONS.map((ext) => `.${ext}`).join(',');
const DESIGN_MAX_BYTES = 50 * 1024 * 1024;

function getExtension(filename) {
  return (filename.split('.').pop() || '').toLowerCase();
}

// kind: 'proof' (bukti transfer, gambar, dikompres) | 'design' (file desain cetak, drag & drop)
export default function FileUploadField({ kind, label, helpText, required, value, onUploaded }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const uploadFile = async (file) => {
    if (!file) return;
    setError('');

    if (kind === 'design') {
      const ext = getExtension(file.name);
      if (!DESIGN_EXTENSIONS.includes(ext)) {
        setError(`Format .${ext || '?'} tidak didukung. Format yang diterima: ${DESIGN_EXTENSIONS.join(', ').toUpperCase()}.`);
        return;
      }
      if (file.size > DESIGN_MAX_BYTES) {
        setError('Ukuran file lebih dari 50MB. Kompres dulu atau pecah jadi beberapa file.');
        return;
      }
    }

    setFileName(file.name);
    setBusy(true);
    try {
      const dataUrl = kind === 'proof' ? await compressImage(file) : await readFileAsDataUrl(file);
      const { data } = await uploadService.upload(dataUrl, file.name, kind);
      onUploaded(data.url);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Gagal mengunggah file');
      onUploaded(null);
    } finally {
      setBusy(false);
    }
  };

  const handleChange = (e) => {
    uploadFile(e.target.files?.[0]);
    e.target.value = '';
  };

  if (kind === 'design') {
    const handleDrop = (e) => {
      e.preventDefault();
      setDragOver(false);
      uploadFile(e.dataTransfer.files?.[0]);
    };

    return (
      <div className="field">
        <label>
          {label} {required && <span style={{ color: 'var(--red-500)' }}>*</span>}
        </label>
        {helpText && <p className="text-muted" style={{ fontSize: '0.78rem', margin: '0 0 6px' }}>{helpText}</p>}

        <div
          className={`upload-dropzone${dragOver ? ' upload-dropzone-active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !busy && inputRef.current?.click()}
        >
          <p style={{ margin: 0, fontWeight: 700 }}>Drag &amp; Drop file desain Anda di sini</p>
          <p className="text-muted" style={{ margin: '2px 0 10px', fontSize: '0.82rem' }}>atau klik untuk memilih file</p>
          <button
            type="button"
            className="btn btn-sm"
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            disabled={busy}
          >
            Pilih File
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={DESIGN_ACCEPT}
            onChange={handleChange}
            disabled={busy}
            style={{ display: 'none' }}
          />
        </div>

        {busy && <p className="text-muted" style={{ fontSize: '0.78rem' }}>Mengunggah...</p>}
        {error && <p style={{ color: '#9b1530', fontSize: '0.78rem' }}>{error}</p>}
        {value && !busy && !error && (
          <p style={{ color: 'var(--success)', fontSize: '0.78rem' }}>File terunggah ✓{fileName ? ` (${fileName})` : ''}</p>
        )}

        <div className="upload-notes">
          <p style={{ margin: '10px 0 2px', fontSize: '0.78rem' }}>
            <strong>Format yang diterima:</strong> PDF, AI, CDR, PSD, JPG, PNG, ZIP, RAR, dan STL
          </p>
          <p style={{ margin: '2px 0', fontSize: '0.78rem' }}>Jika file lebih dari satu, gabungkan dengan ZIP/RAR.</p>
          <p style={{ margin: '2px 0 10px', fontSize: '0.78rem' }}>Ukuran maksimal file desain: 50MB per file.</p>

          <p style={{ margin: '0 0 4px', fontSize: '0.82rem', fontWeight: 700 }}>Tips Upload Desain</p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.78rem' }}>
            <li>Pastikan desain sudah siap cetak.</li>
            <li>Resolusi minimal 300 DPI untuk hasil terbaik.</li>
            <li>Gunakan mode warna CMYK untuk hasil akurat.</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="field">
      <label>
        {label} {required && <span style={{ color: 'var(--red-500)' }}>*</span>}
      </label>
      {helpText && <p className="text-muted" style={{ fontSize: '0.78rem', margin: '0 0 6px' }}>{helpText}</p>}
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleChange}
        disabled={busy}
      />
      {busy && <p className="text-muted" style={{ fontSize: '0.78rem' }}>Mengunggah...</p>}
      {error && <p style={{ color: '#9b1530', fontSize: '0.78rem' }}>{error}</p>}
      {value && !busy && <p style={{ color: 'var(--success)', fontSize: '0.78rem' }}>File terunggah ✓</p>}
    </div>
  );
}
