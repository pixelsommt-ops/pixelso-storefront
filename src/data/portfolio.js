// Data portofolio Pixelso.
//
// KENAPA FILE INI, BUKAN DATABASE ERP
// -----------------------------------
// Portofolio adalah konten marketing yang jarang berubah dan ditulis tangan
// (butuh cerita, bukan sekadar field). Menyimpannya di repo berarti:
//   - tidak perlu menyentuh backend ERP (Protected Zone, lihat DEVELOPMENT-GATE.md)
//   - ikut ter-prerender otomatis saat `npm run build:seo`
//   - riwayat perubahannya terekam di git
//
// ATURAN ISI - WAJIB DIBACA SEBELUM MENAMBAH
// ------------------------------------------
// SEMUA isian harus pekerjaan NYATA yang benar-benar pernah dikerjakan Pixelso.
//
// Halaman portofolio bekerja karena ia bukti sosial. Mengarang pekerjaan,
// lokasi, atau ukuran = menipu calon pelanggan, dan kalau ketahuan merusak
// kepercayaan yang justru mau dibangun. Google juga menilai halaman tipis
// berisi klaim tanpa bukti sebagai konten berkualitas rendah.
//
// Kalau belum ada data pekerjaan nyata, biarkan array ini kosong. Halaman
// portofolio akan otomatis menampilkan keadaan "belum ada" yang jujur,
// dan URL-nya TIDAK akan dimasukkan ke sitemap.
//
// CARA MENAMBAH PEKERJAAN
// -----------------------
// Salin blok di bawah, isi dengan data sebenarnya:
//
//   {
//     slug: 'banner-ppdb-smpn-1-gemolong',   // URL: /portfolio/<slug>
//     title: 'Banner PPDB SMPN 1 Gemolong',  // jadi H1 + judul tab
//     client: 'SMPN 1 Gemolong',             // boleh dikosongkan kalau pelanggan
//                                            // tidak mau namanya dipakai
//     location: 'Gemolong, Sragen',
//     category: 'Banner / MMT',              // sebaiknya sama dengan kategori katalog
//     size: '3 x 1 meter',
//     material: 'Flexy China 280 gsm',
//     finishing: 'Mata ayam tiap 50 cm',
//     quantity: '2 pcs',
//     duration: '1 hari',                    // waktu pengerjaan sebenarnya
//     publishedAt: '2026-09-15',             // YYYY-MM-DD, dipakai sitemap lastmod
//     need: 'Spanduk pendaftaran siswa baru yang terbaca dari seberang jalan.',
//     process: 'Desain ... lalu cetak ... finishing ...',   // 2-4 kalimat
//     result: 'Terpasang di gerbang sekolah ...',
//     images: ['/uploads/nama-file-deskriptif.webp'],       // foto HASIL NYATA
//     relatedProductKey: 'banner',           // key produk di katalog -> tombol CTA
//   },
//
// CATATAN FOTO
// ------------
// Pakai nama file deskriptif (banner-ppdb-smpn1-gemolong.webp), bukan
// IMG_8291.jpg atau WhatsApp-Image.jpg. Itu sinyal SEO gambar.
// Foto harus hasil pekerjaan itu sendiri, bukan foto katalog/stok.

export const PORTFOLIO = [
  // Belum ada entri. Isi dengan pekerjaan nyata - lihat template di komentar atas.
];

export function getPortfolioItem(slug) {
  return PORTFOLIO.find((item) => item.slug === slug) || null;
}

export function hasPortfolio() {
  return PORTFOLIO.length > 0;
}
