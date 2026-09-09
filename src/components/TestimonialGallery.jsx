import { useEffect, useState } from 'react';
import * as testimonialService from '../services/testimonialService';

// Trust signal (audit Content & Conversion Points, 2026-09-09) - screenshot ulasan Google Maps
// asli yang sudah di-approve staf (lihat ERP > Review Voucher), bukan testimoni yang dikarang.
// Render null total kalau belum ada data approved, supaya section ini tidak pernah nampilin
// area kosong.
export default function TestimonialGallery({ centered = false }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    testimonialService
      .getTestimonials()
      .then(({ data }) => setItems(data || []))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="section container home-secondary">
      <div className={`section-head${centered ? ' section-head-center' : ''}`}>
        <h2>Ulasan Pelanggan</h2>
        <p className="text-muted section-head-desc">Screenshot ulasan asli dari pelanggan kami di Google Maps.</p>
      </div>
      <div className="grid grid-4 ecommerce-gallery-grid">
        {items.slice(0, 8).map((item) => (
          <a
            key={item.id}
            href={item.screenshotUrl}
            target="_blank"
            rel="noreferrer"
            className="card card-sm"
            style={{ padding: '0.75rem', textDecoration: 'none' }}
          >
            <img
              src={item.screenshotUrl}
              alt="Ulasan pelanggan Pixelso Gemolong"
              loading="lazy"
              style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: '3px' }}
            />
          </a>
        ))}
      </div>
    </section>
  );
}
