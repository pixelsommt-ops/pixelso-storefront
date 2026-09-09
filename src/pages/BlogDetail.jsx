import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as blogService from '../services/blogService';
import RichText from '../components/RichText';
import Seo from '../components/Seo';
import ProductCard from '../components/ProductCard';
import useCatalogStore from '../store/catalogStore';

function stripHtml(html) {
  return String(html ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const products = useCatalogStore((s) => s.products);
  const fetchCatalog = useCatalogStore((s) => s.fetchCatalog);
  const relatedProducts = products.filter((p) => p.active).slice(0, 4);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    setPost(null);
    setError('');
    blogService
      .getPost(slug)
      .then(({ data }) => setPost(data))
      .catch(() => setError('Artikel tidak ditemukan'));
  }, [slug]);

  if (error) {
    return (
      <div className="section container">
        <div className="alert alert-error">{error}</div>
        <Link to="/blog" className="btn btn-secondary">Kembali ke Blog</Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="section container">
        <p className="text-muted">Memuat artikel...</p>
      </div>
    );
  }

  return (
    <div className="section container">
      <Seo
        title={post.title}
        description={stripHtml(post.content).slice(0, 200) || undefined}
        path={`/blog/${post.slug}`}
        image={post.coverImageUrl}
      />
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link to="/blog" className="text-muted" style={{ fontSize: '0.85rem' }}>&larr; Kembali ke Blog</Link>
        <h1 style={{ marginTop: '0.75rem' }}>{post.title}</h1>
        {post.coverImageUrl && (
          <img
            src={post.coverImageUrl}
            alt={`${post.title} - artikel blog Pixelso Gemolong`}
            loading="eager"
            fetchPriority="high"
            style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: '3px', margin: '1rem 0' }}
          />
        )}
        <RichText html={post.content} variant="blog" className="blog-post-body" style={{ fontSize: '1rem', lineHeight: 1.7 }} />
        <hr style={{ margin: '2rem 0 1rem', border: 'none', borderTop: '1px solid var(--line)' }} />
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
          Dikirim oleh <strong>{post.author?.name}</strong> &middot; {formatDate(post.publishedAt)}
        </p>
      </div>

      {/* Internal link ke produk - sebelumnya artikel blog tidak pernah mengarahkan traffic
          organik ke halaman produk/katalog sama sekali (cuma link "kembali ke blog"). */}
      {relatedProducts.length > 0 && (
        <div style={{ maxWidth: 960, margin: '2.5rem auto 0' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '1.2rem' }}>Produk Pilihan</h2>
            <Link to="/katalog" className="text-muted" style={{ fontSize: '0.85rem' }}>Lihat semua produk &rarr;</Link>
          </div>
          <div className="grid grid-4 product-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.key} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
