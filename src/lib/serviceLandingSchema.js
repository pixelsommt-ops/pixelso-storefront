const SITE_URL = 'https://www.cetakpixelso.com';

export function buildServiceLandingSchema(page) {
  if (!page?.slug || !page?.title || !page?.description) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.title,
    description: page.description,
    url: `${SITE_URL}/${page.slug}`,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Percetakan Pixelso',
      url: `${SITE_URL}/`,
    },
    areaServed: [
      { '@type': 'City', name: 'Gemolong' },
      { '@type': 'AdministrativeArea', name: 'Sragen' },
    ],
    serviceType: page.heroTitle,
  };
}

export function buildServiceLandingBreadcrumb(page) {
  if (!page?.slug || !page?.title) return null;
  const items = [
    { name: 'Beranda', item: `${SITE_URL}/` },
    { name: page.title, item: `${SITE_URL}/${page.slug}` },
  ];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

export function buildServiceLandingFaqSchema(page) {
  if (!Array.isArray(page?.faqs) || page.faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
