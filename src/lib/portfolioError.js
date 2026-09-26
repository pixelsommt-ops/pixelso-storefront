import { AxiosError } from 'axios';

export function classifyPortfolioError(error) {
  return error instanceof AxiosError && error.response?.status === 404
    ? 'not-found'
    : 'unavailable';
}

export function classifyPortfolioPayload(data) {
  if (!data || typeof data !== 'object') return 'unavailable';
  if (typeof data.slug !== 'string' || !data.slug.trim()) return 'unavailable';
  if (typeof data.title !== 'string' || !data.title.trim()) return 'unavailable';
  if (!Array.isArray(data.images) || data.images.some((image) => typeof image !== 'string')) {
    return 'unavailable';
  }

  const optionalTextFields = [
    'summary', 'client', 'location', 'category', 'size', 'material', 'finishing',
    'quantity', 'duration', 'needText', 'processText', 'resultText',
    'relatedProductKey', 'publishedAt',
  ];
  if (optionalTextFields.some((field) => data[field] != null && typeof data[field] !== 'string')) {
    return 'unavailable';
  }

  return 'ready';
}

export function isPortfolioResultCurrent(resolvedSlug, currentSlug) {
  return Boolean(resolvedSlug) && resolvedSlug === currentSlug;
}

export function createRequestGuard() {
  let active = true;
  return {
    isActive: () => active,
    cancel: () => { active = false; },
  };
}
