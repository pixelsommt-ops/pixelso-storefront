import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as catalogService from '../services/catalogService';
import PriceCalculatorForm from '../components/PriceCalculatorForm';
import UploadDesainPanel from '../components/UploadDesainPanel';
import ShareRow from '../components/ShareRow';
import RichText from '../components/RichText';
import useCartStore from '../store/cartStore';
import { formatCurrency, productImageAlt } from '../lib/format';
import { trackViewContent, trackAddToCart } from '../lib/analytics';
import Seo from '../components/Seo';

function stripHtml(html) {
  return String(html ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function ProductDetail() {
  const { productKey } = useParams();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [fileUrl, setFileUrl] = useState(null);
  const [designLink, setDesignLink] = useState('');
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    catalogService.getCatalog().then(({ data }) => setCatalog(data)).catch(() => setError('Gagal memuat produk'));
  }, []);

  useEffect(() => {
    setActivePhoto(0);
    setFileUrl(null);
    setDesignLink('');
    setAdded(false);
  }, [productKey]);

  // ViewContent (Fase 1.A) - dipisah jadi useEffect sendiri (bukan langsung di body komponen)
  // supaya tetap di atas kedua early return di bawah dan urutan hook tidak berubah antar render.
  useEffect(() => {
    const product = catalog?.products.find((p) => p.key === productKey);
    if (product) trackViewContent(product);
  }, [catalog, productKey]);

  if (error) return <div className="section container"><div className="alert alert-error">{error}</div></div>;
  if (!catalog) return <div className="section container"><p className="text-muted">Memuat...</p></div>;

  const product = catalog.products.find((p) => p.key === productKey);
  if (!product) {
    return (
      <div className="section container">
        <div className="alert alert-error">Produk tidak ditemukan.</div>
      </div>
    );
  }

  const photos = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);
  const mainPhoto = photos[activePhoto] || photos[0];

  const handleAddToCart = (item) => {
    addItem({ ...item, fileUrl, designLink: designLink || null, specNote: '' });
    setAdded(true);
    trackAddToCart(product, item.estimatedTotal);
  };

  return (
    <div className="section container">
      <Seo
        title={product.name}
        description={stripHtml(product.description).slice(0, 200) || undefined}
        path={`/produk/${product.key}`}
        image={mainPhoto}
      />
      <div className="grid grid-2">
        <div>
          {mainPhoto ? (
            <img
              src={mainPhoto}
              alt={productImageAlt(product)}
              style={{ width: '100%', borderRadius: '3px', marginBottom: 8, objectFit: 'cover', maxHeight: 320 }}
            />
          ) : (
            <div className="product-thumb" style={{ height: 200, fontSize: '2.5rem', marginBottom: 8 }}>
              {product.name.charAt(0)}
            </div>
          )}

          {photos.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {photos.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActivePhoto(index)}
                  style={{
                    padding: 0,
                    border: index === activePhoto ? '2px solid var(--red-500, #ef3e55)' : '2px solid transparent',
                    borderRadius: 3,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: 'none',
                    width: 64,
                    height: 64,
                    flexShrink: 0,
                  }}
                  aria-label={`Lihat foto ${index + 1}`}
                >
                  <img src={url} alt={productImageAlt(product, `foto ${index + 1}`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          {product.videoUrl && /^https?:\/\//i.test(product.videoUrl) && (
            <a
              href={product.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}
            >
              ▶ Lihat Video Produk
            </a>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span className="eyebrow" style={{ margin: 0 }}>
              Harga per {product.unitLabel || (product.mode === 'area' ? 'm²' : 'pcs')}
            </span>
            {product.soldCount > 0 && <span className="badge badge-muted">{product.soldCount}+ terjual</span>}
            {product.discount && (
              <span className="badge badge-discount">
                {product.discount.type === 'percent' ? `Diskon ${product.discount.value}%` : `Diskon ${formatCurrency(product.discount.value)}`}
              </span>
            )}
          </div>
          <h1>{product.name}</h1>

          <ShareRow productName={product.name} />

          <RichText
            html={product.description}
            className="text-muted rich-description"
            fallback="Estimasi harga otomatis berdasarkan ukuran, jumlah, bahan, dan finishing yang dipilih."
          />

          {Array.isArray(product.specs) && product.specs.length > 0 && (
            <div className="card card-sm" style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: '0.9rem' }}>Spesifikasi</h2>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {product.specs.map((spec, index) => (
                  <li key={index} className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 4 }}>{spec}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="alert alert-warning">
            <strong>Catatan untuk Perbedaan Hasil Warna Cetak</strong>
            <p style={{ margin: '4px 0 0' }}>
              Warna hasil cetak bisa terlihat sedikit berbeda dari tampilan di layar Anda. Ini wajar
              karena layar memakai skema warna RGB (cahaya), sedangkan mesin cetak kami memakai tinta
              CMYK. Tim kami selalu memastikan hasil cetak tetap optimal sesuai standar kualitas terbaik.
            </p>
          </div>

          {added && (
            <div className="alert alert-success">
              Ditambahkan ke keranjang.{' '}
              <button type="button" className="btn btn-sm btn-primary" onClick={() => navigate('/keranjang')}>
                Lihat Keranjang
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 24 }}>
        <PriceCalculatorForm catalog={catalog} product={product} onAddToCart={handleAddToCart} />
        <UploadDesainPanel
          fileUrl={fileUrl}
          designLink={designLink}
          onChangeFileUrl={setFileUrl}
          onChangeDesignLink={setDesignLink}
        />
      </div>
    </div>
  );
}
