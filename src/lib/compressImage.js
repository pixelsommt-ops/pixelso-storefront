// Port dari public/pixelso-admin.js milik landing page (compressImage). Dipakai KHUSUS untuk
// upload bukti bayar (foto layar transfer) - JANGAN dipakai untuk file desain cetak, karena
// rekompresi lossy ke WebP kualitas rendah akan merusak file yang akan dicetak.
export function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('File bukan gambar.'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('File tidak dapat dibaca.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Gambar tidak dapat diproses.'));
      image.onload = () => {
        const maxWidth = 1400;
        const maxHeight = 1000;
        const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        let quality = 0.8;
        let data = canvas.toDataURL('image/webp', quality);
        while (data.length > 600000 && quality > 0.42) {
          quality -= 0.08;
          data = canvas.toDataURL('image/webp', quality);
        }
        resolve(data);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
