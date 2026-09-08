import { Link } from 'react-router-dom';
import { formatCurrency, truncateDescription, productImageAlt } from '../lib/format';

export default function ProductCard({ product }) {
  const { text: descriptionPreview, isTruncated } = truncateDescription(product.description);

  return (
    <Link to={`/produk/${product.key}`} className="card product-card" style={{ textDecoration: 'none' }}>
      {product.imageUrl ? (
        <div className="product-thumb">
          <img src={product.imageUrl} alt={productImageAlt(product)} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div className="product-thumb">{product.name.charAt(0)}</div>
      )}
      <div className="product-card-body">
        <h3 style={{ fontSize: '1rem' }}>{product.name}</h3>
        <div className="product-card-detail">
          {descriptionPreview && (
            <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
              {descriptionPreview}
              {isTruncated && (
                <>
                  {'... '}
                  <span style={{ color: 'var(--maroon-800)', fontWeight: 700 }}>Selengkapnya</span>
                </>
              )}
            </p>
          )}
          <p className="text-muted" style={{ fontSize: '0.82rem', margin: 0 }}>
            Harga per {product.unitLabel || (product.mode === 'area' ? 'm²' : 'pcs')}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.3rem' }}>
          <div>
            {product.discount && (
              <p className="price-original" style={{ margin: 0 }}>{formatCurrency(product.originalBaseRate)}</p>
            )}
            <p className="price-tag" style={{ margin: 0 }}>Mulai {formatCurrency(product.baseRate)}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
            {product.discount && (
              <span className="badge badge-discount">
                {product.discount.type === 'percent' ? `-${product.discount.value}%` : `-${formatCurrency(product.discount.value)}`}
              </span>
            )}
            {product.soldCount > 0 && <span className="badge badge-muted">{product.soldCount}+ terjual</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
