import { useEffect, useRef, useState } from 'react';

// Animasi singkat (fade+geser naik) saat elemen masuk viewport pas discroll - dipakai bungkus
// tiap section di HomeEcommerce.jsx. Sekali muncul, tetap muncul (observer diputus) - bukan
// animasi berulang tiap scroll naik-turun. Hormat prefers-reduced-motion lewat CSS (lihat
// .reveal di index.css), bukan di sini - animasi tetap "aktif" secara logic, cuma CSS-nya yang
// menonaktifkan transisi visualnya buat yang minta gerakan minim.
export default function ScrollReveal({ children, className = '', as: Tag = 'div' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
