import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const SLIDE_INTERVAL_MS = 3000;

// Slideshow foto hero - dipakai di Home.jsx menggantikan foto hero tunggal lama. Tiap slide
// opsional bisa diklik (link internal "/..." pakai react-router Link, link eksternal http(s)
// dibuka tab baru) untuk materi promosi atau mengarahkan ke produk unggulan.
export default function HeroCarousel({ slides, altText }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides]);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="hero-carousel">
      {slides.map((slide, index) => {
        const img = (
          <img
            src={slide.url}
            alt={`${altText} ${index + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        );
        const wrapperStyle = {
          position: 'absolute',
          inset: 0,
          opacity: index === activeIndex ? 1 : 0,
          transition: 'opacity 0.6s ease',
          pointerEvents: index === activeIndex ? 'auto' : 'none',
        };

        if (!slide.linkUrl) {
          return <div key={slide.url} style={wrapperStyle}>{img}</div>;
        }
        if (/^https?:\/\//i.test(slide.linkUrl)) {
          return (
            <a key={slide.url} href={slide.linkUrl} target="_blank" rel="noreferrer" style={wrapperStyle}>
              {img}
            </a>
          );
        }
        return (
          <Link key={slide.url} to={slide.linkUrl} style={wrapperStyle}>
            {img}
          </Link>
        );
      })}

      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
          {slides.map((slide, index) => (
            <button
              key={slide.url}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Slide ${index + 1}`}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                background: index === activeIndex ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
