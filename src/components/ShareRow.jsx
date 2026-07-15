import { useState } from 'react';
import { InstagramIcon, TiktokIcon, ThreadsIcon, WhatsappIcon, CopyLinkIcon } from './SocialIcons';

// WhatsApp punya share-link resmi (wa.me/?text=...); Instagram/TikTok/Threads tidak punya
// URL resmi untuk share konten ke luar, jadi ketiganya + tombol Copy Link sama-sama cuma
// menyalin link produk ke clipboard (satu-satunya cara yang benar-benar berfungsi).
export default function ShareRow({ productName }) {
  const [copiedLabel, setCopiedLabel] = useState('');

  const productUrl = typeof window !== 'undefined' ? window.location.href : '';
  const waHref = `https://wa.me/?text=${encodeURIComponent(`${productName} - ${productUrl}`)}`;

  const copyLink = async (label) => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopiedLabel(label);
      setTimeout(() => setCopiedLabel(''), 2500);
    } catch {
      setCopiedLabel('Gagal menyalin link');
      setTimeout(() => setCopiedLabel(''), 2500);
    }
  };

  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Bagikan:</span>
        <a href={waHref} target="_blank" rel="noreferrer" className="share-icon-btn" aria-label="Bagikan lewat WhatsApp">
          <WhatsappIcon width={18} height={18} />
        </a>
        <button type="button" className="share-icon-btn" aria-label="Salin link untuk Instagram" onClick={() => copyLink('Link disalin, tempel di Instagram')}>
          <InstagramIcon width={18} height={18} />
        </button>
        <button type="button" className="share-icon-btn" aria-label="Salin link untuk TikTok" onClick={() => copyLink('Link disalin, tempel di TikTok')}>
          <TiktokIcon width={18} height={18} />
        </button>
        <button type="button" className="share-icon-btn" aria-label="Salin link untuk Threads" onClick={() => copyLink('Link disalin, tempel di Threads')}>
          <ThreadsIcon width={18} height={18} />
        </button>
        <button type="button" className="share-icon-btn" aria-label="Salin link produk" onClick={() => copyLink('Link produk disalin')}>
          <CopyLinkIcon width={18} height={18} />
        </button>
      </div>
      {copiedLabel && <div className="share-toast">{copiedLabel}</div>}
    </div>
  );
}
