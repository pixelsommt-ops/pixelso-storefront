// Fallback dipakai sebelum data asli dari ERP selesai di-fetch (lihat store/siteSettingsStore.js)
// atau kalau fetch gagal - supaya halaman tidak pernah tampil kosong. Sumber kebenaran sekarang
// ada di ERP (halaman "Halaman Depan (Website)"), bukan file ini.
export const DEFAULT_BUSINESS = {
  name: 'Pixelso Gemolong',
  tagline: 'Print • Design • Create',
  description:
    'Percetakan lengkap satu atap untuk banner, stiker, apparel, offset, merchandise, laser cutting, dan branding.',
  address: 'Jl. Raya Solo–Purwodadi Km. 20 Gemolong, sekitar 100 m selatan perempatan',
  openingHours: 'Senin–Sabtu • Konsultasi desain & cetak',
  whatsapp: '08156609299',
  instagram: 'cetakpixelso',
  tiktok: 'kreasi.umkm.solo',
  youtube: '',
  facebook: '',
  heroSlides: [],
  galleryImages: [],
};

export function waLink(phone, message) {
  const digits = String(phone || '').replace(/\D/g, '');
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}
