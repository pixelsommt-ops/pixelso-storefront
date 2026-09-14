// Ubah isi field sosial dari ERP jadi URL yang benar.
//
// Kenapa ada: field `facebook` di ERP diisi manusia lewat form, dan isinya tidak selalu
// username. Di production nilainya pernah berupa NAMA HALAMAN ("Pixelso Gemolong") -
// kalau ditempel apa adanya jadi `facebook.com/Pixelso Gemolong`, tautannya rusak.
//
// Karena itu nilai yang tidak bisa dipastikan berupa username TIDAK dirender sama sekali.
// Lebih baik tautan tidak muncul daripada muncul tapi menuju halaman error - pengunjung
// yang mengklik tautan rusak kemungkinan besar tidak mencoba lagi.

// Username Facebook: huruf, angka, titik. Spasi berarti itu nama halaman, bukan username.
const FB_USERNAME = /^[A-Za-z0-9.]{5,50}$/;

/**
 * @param {string} value isi field facebook dari ERP (username, URL penuh, atau nama halaman)
 * @returns {string|null} URL halaman Facebook, atau null kalau tidak bisa dipastikan
 */
export function facebookUrl(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  // Sudah berupa URL penuh - pakai apa adanya.
  if (/^https?:\/\//i.test(raw)) {
    return /facebook\.com/i.test(raw) ? raw : null;
  }

  // Bentuk "facebook.com/xxx" tanpa protokol.
  const tanpaDomain = raw.replace(/^(?:www\.)?facebook\.com\//i, '');
  const bersih = tanpaDomain.replace(/^@/, '').replace(/\/+$/, '');

  if (!FB_USERNAME.test(bersih)) return null;
  return `https://www.facebook.com/${bersih}`;
}
