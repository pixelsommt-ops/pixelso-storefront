import DOMPurify from 'dompurify';

// Harus sama dengan whitelist di backend (~/pixelso-erp/backend/src/common/utils/htmlSanitize.js)
// - lapis sanitasi kedua (defense-in-depth), ini yang jadi batas nyata sebelum tampil ke customer.
// Dipakai di semua tempat yang merender konten rich text dari ERP (deskripsi produk, deskripsi bisnis).
const ALLOWED_TAGS = ['b', 'strong', 'i', 'em', 'u', 's', 'strike', 'p', 'br', 'ul', 'ol', 'li'];

export default function RichText({ html, className, style, fallback }) {
  if (!html) {
    return fallback ? <p className={className} style={style}>{fallback}</p> : null;
  }
  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: [] }) }}
    />
  );
}
