// Dipakai untuk upload file desain - TANPA rekompresi (beda dari compressImage.js yang dipakai
// khusus untuk bukti bayar), supaya file cetak-siap pelanggan tidak rusak kualitasnya.
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('File tidak dapat dibaca.'));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}
