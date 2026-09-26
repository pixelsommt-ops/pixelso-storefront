import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import JsonLd from '../components/JsonLd';
import useCatalogStore from '../store/catalogStore';
import useSiteSettingsStore from '../store/siteSettingsStore';
import { getLandingPage } from '../data/serviceLandingPages';
import {
  buildServiceLandingBreadcrumb,
  buildServiceLandingFaqSchema,
  buildServiceLandingSchema,
} from '../lib/serviceLandingSchema';
import { waLink } from '../lib/business';
import { trackContact } from '../lib/analytics';

export default function ServiceLanding() {
  const { landingSlug } = useParams();
  const page = getLandingPage(landingSlug);
  const products = useCatalogStore((state) => state.products);
  const fetchCatalog = useCatalogStore((state) => state.fetchCatalog);
  const business = useSiteSettingsStore((state) => state.settings);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  if (!page) {
    return (
      <div className="section container">
        <Seo title="Layanan tidak ditemukan" path={`/${landingSlug}`} noindex />
        <div className="alert alert-error">Layanan tidak ditemukan.</div>
        <Link to="/katalog" className="btn btn-secondary">Lihat Katalog</Link>
      </div>
    );
  }

  const related = page.relatedProductKeys
    .map((key) => products.find((product) => product.key === key && product.active))
    .filter(Boolean);
  const whatsappHref = waLink(business.whatsapp, page.whatsappMessage);

  return (
    <div className="section container">
      <Seo title={page.title} description={page.description} path={`/${page.slug}`} />
      <JsonLd id="service" data={buildServiceLandingSchema(page)} />
      <JsonLd id="service-breadcrumb" data={buildServiceLandingBreadcrumb(page)} />
      <JsonLd id="service-faq" data={buildServiceLandingFaqSchema(page)} />

      <section style={{ maxWidth: 900, margin: '0 auto' }}>
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.heroTitle}</h1>
        <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.8, maxWidth: 780 }}>
          {page.intro}
        </p>
        {business.whatsapp && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{ marginTop: '0.75rem' }}
            onClick={() => trackContact(`landing_${page.slug}`)}
          >
            Konsultasi via WhatsApp
          </a>
        )}
      </section>

      <section className="section" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="section-head">
          <h2>Yang Bisa Anda Konsultasikan</h2>
        </div>
        <div className="grid grid-3">
          {page.benefits.map((benefit) => (
            <article key={benefit.title} className="card">
              <h3 style={{ fontSize: '1rem', marginTop: 0 }}>{benefit.title}</h3>
              <p className="text-muted" style={{ lineHeight: 1.7, marginBottom: 0 }}>{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="section-head">
          <h2>Alur Pemesanan</h2>
        </div>
        <ol className="card" style={{ paddingLeft: '2.5rem', lineHeight: 1.8 }}>
          {page.process.map((step) => <li key={step} style={{ marginBottom: '0.65rem' }}>{step}</li>)}
        </ol>
      </section>

      {related.length > 0 && (
        <section className="section" style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="section-head">
            <h2>Produk Terkait</h2>
            <p className="text-muted">Lihat produk yang sudah memiliki spesifikasi dan kalkulator harga online.</p>
          </div>
          <div className="grid grid-3 product-grid">
            {related.map((product) => (
              <Link key={product.key} to={`/produk/${product.key}`} className="card product-card" style={{ textDecoration: 'none' }}>
                {product.imageUrl ? (
                  <div className="product-thumb">
                    <img src={product.imageUrl} alt={product.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div className="product-thumb">{product.name.charAt(0)}</div>
                )}
                <div className="product-card-body">
                  <h3 style={{ fontSize: '1rem', margin: 0 }}>{product.name}</h3>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Lihat spesifikasi & hitung harga</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="section-head">
          <h2>Pertanyaan yang Sering Ditanyakan</h2>
        </div>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {page.faqs.map((faq) => (
            <details key={faq.question} className="card">
              <summary style={{ cursor: 'pointer', fontWeight: 700 }}>{faq.question}</summary>
              <p className="text-muted" style={{ lineHeight: 1.7, marginBottom: 0 }}>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="card" style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ marginTop: 0 }}>Ceritakan kebutuhan Anda kepada Pixelso</h2>
        <p className="text-muted">
          Kirim jumlah, ukuran, desain atau referensi, serta target waktu. Admin akan membantu memastikan detailnya sebelum produksi.
        </p>
        {business.whatsapp ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            onClick={() => trackContact(`landing_bottom_${page.slug}`)}
          >
            Mulai Konsultasi
          </a>
        ) : (
          <Link to="/katalog" className="btn btn-primary">Lihat Katalog</Link>
        )}
      </section>
    </div>
  );
}
