import DOMPurify from 'dompurify';

// Harus sama dengan whitelist di backend (~/pixelso-erp/backend/src/common/utils/htmlSanitize.js)
// - lapis sanitasi kedua (defense-in-depth), ini yang jadi batas nyata sebelum tampil ke customer.
// Dipakai di semua tempat yang merender konten rich text dari ERP (deskripsi produk, deskripsi bisnis).
const BASE_ALLOWED_TAGS = ['b', 'strong', 'i', 'em', 'u', 's', 'strike', 'p', 'br', 'ul', 'ol', 'li'];

// Variant "blog" (Blog Karyawan, 2026-07-31) - whitelist lebih longgar, harus sama dengan
// BLOG_ALLOWED_TAGS di sanitizeBlogContentHtml (htmlSanitize.js). Aman melebarkan ALLOWED_ATTR di
// sini karena src iframe/img SUDAH divalidasi ketat di backend sebelum tersimpan (domain
// whitelist utk iframe, /uploads/ atau https:// utk img) - lapis ini cuma jaga struktur tag.
const BLOG_ALLOWED_TAGS = [...BASE_ALLOWED_TAGS, 'img', 'iframe', 'div', 'a'];
const BLOG_ALLOWED_ATTR = ['src', 'alt', 'loading', 'title', 'allow', 'allowfullscreen', 'referrerpolicy', 'class', 'href', 'target', 'rel'];

export default function RichText({ html, className, style, fallback, variant = 'default' }) {
  if (!html) {
    return fallback ? <p className={className} style={style}>{fallback}</p> : null;
  }
  const allowedTags = variant === 'blog' ? BLOG_ALLOWED_TAGS : BASE_ALLOWED_TAGS;
  const allowedAttr = variant === 'blog' ? BLOG_ALLOWED_ATTR : [];
  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html, { ALLOWED_TAGS: allowedTags, ALLOWED_ATTR: allowedAttr }) }}
    />
  );
}
