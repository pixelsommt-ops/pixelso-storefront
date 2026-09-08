import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as blogService from '../services/blogService';
import Seo from '../components/Seo';

function formatDate(value) {
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Blog() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    blogService.getPosts().then(({ data }) => setPosts(data)).catch(() => setError('Gagal memuat artikel'));
  }, []);

  return (
    <div className="section container">
      <Seo title="Blog" description="Tips seputar cetak, desain, dan cerita di balik layar Pixelso." path="/blog" />
      <div className="section-head">
        <h1>Blog</h1>
        <p className="text-muted">Tips seputar cetak, desain, dan cerita di balik layar Pixelso.</p>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {!posts && !error && <p className="text-muted">Memuat artikel...</p>}
      {posts && posts.length === 0 && (
        <div className="card" style={{ maxWidth: 640, textAlign: 'center' }}>
          <h3>Segera Hadir</h3>
          <p className="text-muted" style={{ margin: 0 }}>
            Kami sedang menyiapkan artikel-artikel menarik untuk halaman ini. Pantau terus ya!
          </p>
        </div>
      )}
      {posts && posts.length > 0 && (
        <div className="grid grid-4 product-grid">
          {posts.map((post) => (
            <Link key={post.postId} to={`/blog/${post.slug}`} className="card product-card" style={{ textDecoration: 'none' }}>
              {post.coverImageUrl ? (
                <div className="product-thumb">
                  <img src={post.coverImageUrl} alt={`${post.title} - artikel blog Pixelso Gemolong`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div className="product-thumb">{post.title.charAt(0)}</div>
              )}
              <div className="product-card-body">
                <h3 style={{ fontSize: '1rem' }}>{post.title}</h3>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                  {post.author?.name} &middot; {formatDate(post.publishedAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
