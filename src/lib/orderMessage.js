// Susun pesan WhatsApp berisi rincian pesanan dari hasil kalkulator harga.
//
// Kenapa ada: checkout mewajibkan daftar akun (lihat ProtectedRoute di AppRoutes.jsx dan
// authenticateCustomer di backend). Untuk pengunjung baru - terutama yang datang dari iklan
// atau pencarian - "daftar akun dulu" adalah penghalang terbesar sebelum memesan. Jalur
// WhatsApp ini melewati checkout sepenuhnya tanpa mengubah alur checkout yang sudah jalan.
//
// Pesan sengaja memuat ukuran, pilihan opsi, dan estimasi harga supaya tim tidak perlu
// bertanya ulang dari nol, dan pelanggan tidak perlu mengetik apa pun.

import { formatCurrency } from './format';

// Ambil satuan yang enak dibaca manusia untuk baris "Jumlah".
function unitLabelOf(product) {
  if (product?.unitLabel) return product.unitLabel;
  return (product?.calcType || product?.mode) === 'area' ? 'm²' : 'pcs';
}

/**
 * Susun teks pesan pesanan.
 *
 * @param {object} product        produk dari katalog
 * @param {object} result         hasil calculatePrintPrice (boleh tidak valid)
 * @param {object} form           { width, height, quantity, needDesign }
 * @param {number} designFee      biaya desain dari katalog
 * @returns {string} teks siap kirim
 */
export function buildOrderMessage(product, result, form, designFee) {
  if (!product) return 'Halo Pixelso, saya mau tanya soal pemesanan.';

  const lines = [`Halo Pixelso, saya mau pesan ${product.name}.`, ''];

  const isArea = (product.calcType || product.mode) === 'area';
  const width = Number(form?.width);
  const height = Number(form?.height);
  if (isArea && width > 0 && height > 0) {
    lines.push(`Ukuran: ${width} x ${height} cm`);
  }

  const quantity = Number(form?.quantity);
  if (quantity > 0) {
    lines.push(`Jumlah: ${quantity} ${isArea ? 'pcs' : unitLabelOf(product)}`);
  }

  // Label pilihan (Bahan, Laminasi, dst) - pakai snapshot dari kalkulator supaya teksnya
  // persis sama dengan yang dilihat pelanggan di form, bukan hasil tebakan id.
  (result?.selectedOptionsSnapshot || []).forEach((opt) => {
    lines.push(`${opt.groupLabel}: ${opt.choiceLabel}`);
  });

  if (form?.needDesign) {
    lines.push(`Minta dibuatkan desain (+${formatCurrency(designFee || 0)})`);
  }

  // Estimasi hanya disertakan kalau perhitungannya valid DAN pelanggan sudah mengisi ukuran.
  //
  // Kenapa cek ukuran terpisah: untuk produk mode area, minArea membuat kalkulator tetap
  // mengembalikan valid=true dengan total = minArea x tarif walau lebar/tinggi masih kosong
  // (mis. banner -> Rp20.000 dari 1 m² minimum). Tanpa cek ini, pesan WhatsApp akan
  // mengirim "Estimasi: Rp20.000" untuk pesanan yang ukurannya belum ditentukan sama sekali -
  // pelanggan menganggapnya harga final, lalu kecewa saat ditagih sesuai ukuran sebenarnya.
  //
  // Kalkulator TIDAK diubah: perilaku minArea itu memang benar untuk penagihan, dan
  // mengubahnya berisiko menggeser harga di seluruh alur pemesanan.
  const ukuranSiap = !isArea || (width > 0 && height > 0);
  if (result?.valid && result.total > 0 && ukuranSiap) {
    lines.push('', `Estimasi: ${formatCurrency(result.total)}`);
  }

  lines.push('', 'Mohon dibantu prosesnya. Terima kasih.');
  return lines.join('\n');
}
