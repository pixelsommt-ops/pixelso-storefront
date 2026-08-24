import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as blogService from '../services/blogService';
import RichText from '../components/RichText';

function formatDate(value) {
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

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
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link to="/blog" className="text-muted" style={{ fontSize: '0.85rem' }}>&larr; Kembali ke Blog</Link>
        <h1 style={{ marginTop: '0.75rem' }}>{post.title}</h1>
        {post.coverImageUrl && (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: '3px', margin: '1rem 0' }}
          />
        )}
        <RichText html={post.content} variant="blog" className="blog-post-body" style={{ fontSize: '1rem', lineHeight: 1.7 }} />
        <hr style={{ margin: '2rem 0 1rem', border: 'none', borderTop: '1px solid var(--line)' }} />
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
          Dikirim oleh <strong>{post.author?.name}</strong> &middot; {formatDate(post.publishedAt)}
        </p>
      </div>
    </div>
  );
}
