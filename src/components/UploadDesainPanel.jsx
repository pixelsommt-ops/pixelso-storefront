import { useState } from 'react';
import FileUploadField from './FileUploadField';
import useAuthStore from '../store/authStore';

// Upload desain di halaman produk (bukan di Checkout lagi) - 2 sub-tab: Upload File (butuh
// login karena endpoint upload di-autentikasi customer) dan Link Desain (teks bebas, tidak
// butuh login, dikirim apa adanya saat checkout).
export default function UploadDesainPanel({ fileUrl, designLink, onChangeFileUrl, onChangeDesignLink }) {
  const customer = useAuthStore((s) => s.customer);
  const [tab, setTab] = useState('file');

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Upload Desain</h3>
      <div className="btn-group" style={{ marginBottom: 12 }}>
        <button
          type="button"
          className={`btn btn-sm ${tab === 'file' ? 'btn-primary' : ''}`}
          onClick={() => setTab('file')}
        >
          Upload File
        </button>
        <button
          type="button"
          className={`btn btn-sm ${tab === 'link' ? 'btn-primary' : ''}`}
          onClick={() => setTab('link')}
        >
          Link Desain
        </button>
      </div>

      {tab === 'file' && (
        customer ? (
          <FileUploadField
            kind="design"
            label="File Desain"
            value={fileUrl}
            onUploaded={onChangeFileUrl}
          />
        ) : (
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Login dulu untuk upload file desain (biar filenya kesimpan aman di akun Anda), atau
            pakai tab "Link Desain" di sebelah sementara belum login.
          </p>
        )
      )}

      {tab === 'link' && (
        <div className="field">
          <label>Link Desain</label>
          <input
            type="url"
            placeholder="https://drive.google.com/... atau link Canva"
            value={designLink || ''}
            onChange={(e) => onChangeDesignLink(e.target.value)}
          />
          <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: 4 }}>
            Tempel link Google Drive/Canva/dsb yang bisa dibuka tim kami.
          </p>
        </div>
      )}

      <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: 12, marginBottom: 0 }}>
        Belum siap desainnya? Tidak masalah, boleh dilewati dan dikirim menyusul via WhatsApp.
      </p>
    </div>
  );
}
