// Landing page layanan berdasarkan intent pencarian lokal. Semua klaim dibuat konservatif:
// tidak ada harga/lead-time/"termurah" hardcode karena detail pesanan perlu dikonfirmasi admin.
export const LANDING_PAGES = [
  {
    slug: 'sablon-kaos-custom',
    title: 'Sablon Kaos Custom Gemolong & Sragen',
    description: 'Layanan sablon kaos custom untuk komunitas, sekolah, usaha, acara, dan kebutuhan pribadi di Gemolong serta Sragen. Konsultasikan desain, jumlah, bahan kaos, ukuran, dan jadwal pengerjaan dengan Pixelso.',
    eyebrow: 'Kaos custom untuk berbagai kebutuhan',
    heroTitle: 'Sablon Kaos Custom di Gemolong, Sragen',
    intro: 'Butuh kaos custom untuk kelas, komunitas, panitia, usaha, atau hadiah? Pixelso membantu menyiapkan cetak DTF pada kaos sesuai desain dan kebutuhan Anda. Pesanan dibahas lebih dulu agar ukuran desain, posisi cetak, warna kaos, jumlah, dan tenggatnya jelas sebelum produksi.',
    benefits: [
      { title: 'Bisa mulai dari kebutuhan kecil', text: 'Cocok untuk pesanan personal, sampel, maupun kelompok. Jumlah dan ketersediaan bahan dikonfirmasi saat konsultasi.' },
      { title: 'Desain warna bebas', text: 'DTF mendukung desain penuh warna, logo, ilustrasi, nama, dan tulisan tanpa membatasi jumlah warna desain.' },
      { title: 'Konsultasi sebelum produksi', text: 'Tim membantu mengecek ukuran desain, posisi cetak, kualitas file, dan pilihan kaos yang sesuai kebutuhan.' },
    ],
    process: [
      'Kirim desain, referensi, jumlah, ukuran kaos, dan target selesai melalui WhatsApp.',
      'Admin mengonfirmasi bahan, ukuran cetak, kesiapan file, estimasi biaya, dan jadwal.',
      'Produksi dimulai setelah detail pesanan dan pembayaran disepakati.',
      'Pesanan dapat diambil di Pixelso Gemolong atau dikirim sesuai kesepakatan.',
    ],
    faqs: [
      { question: 'Apakah sablon kaos custom bisa satuan?', answer: 'Bisa dikonsultasikan untuk kebutuhan satuan maupun kelompok. Ketersediaan ukuran dan warna kaos dikonfirmasi admin sebelum produksi.' },
      { question: 'File desain apa yang sebaiknya dikirim?', answer: 'Kirim PNG transparan beresolusi tinggi, PDF, atau file desain asli bila tersedia. Tim akan mengecek apakah file cukup tajam untuk dicetak.' },
      { question: 'Apakah Pixelso bisa membantu desain?', answer: 'Bisa. Kirim konsep, logo, tulisan, warna, dan contoh gaya yang diinginkan. Biaya serta waktu desain dikonfirmasi setelah kebutuhan dinilai.' },
      { question: 'Berapa lama pengerjaannya?', answer: 'Tergantung jumlah, kesiapan desain, stok kaos, dan antrean produksi. Admin akan memberi estimasi setelah detail pesanan lengkap.' },
    ],
    relatedProductKeys: ['dtf'],
    whatsappMessage: 'Halo Pixelso, saya ingin konsultasi sablon kaos custom. Berikut jumlah, ukuran kaos, dan desain yang saya butuhkan:',
  },
  {
    slug: 'jersey-custom',
    title: 'Jersey Custom Gemolong & Sragen',
    description: 'Konsultasi jersey custom untuk tim olahraga, kelas, komunitas, dan event di Gemolong serta Sragen. Sampaikan desain, jumlah, ukuran, nama, nomor punggung, bahan, dan target pemakaian kepada Pixelso.',
    eyebrow: 'Identitas tim dalam satu desain',
    heroTitle: 'Jersey Custom untuk Tim dan Komunitas di Sragen',
    intro: 'Jersey custom perlu lebih dari sekadar desain menarik: data nama dan nomor harus rapi, ukuran harus dikumpulkan dengan benar, serta bahan perlu disesuaikan dengan aktivitas. Pixelso membantu mengarahkan kebutuhan jersey tim, kelas, komunitas, turnamen, dan event dari tahap konsultasi sampai produksi.',
    benefits: [
      { title: 'Desain sesuai identitas tim', text: 'Warna, logo, sponsor, nama, dan nomor punggung dapat disusun sesuai kebutuhan tim atau kegiatan.' },
      { title: 'Pendataan lebih terstruktur', text: 'Daftar nama, nomor, dan ukuran dibahas sebelum produksi untuk mengurangi risiko salah data.' },
      { title: 'Konsultasi bahan dan pemakaian', text: 'Pilihan bahan disesuaikan dengan jenis aktivitas, anggaran, dan kenyamanan yang dibutuhkan.' },
    ],
    process: [
      'Kirim referensi desain, logo, warna, jumlah, daftar ukuran, nama, dan nomor punggung.',
      'Admin meninjau kebutuhan dan mengonfirmasi opsi bahan, detail desain, biaya, serta estimasi waktu.',
      'Data final diperiksa kembali bersama pemesan sebelum masuk produksi.',
      'Jersey selesai dicek lalu diserahkan atau dikirim sesuai kesepakatan.',
    ],
    faqs: [
      { question: 'Apakah bisa memakai desain jersey sendiri?', answer: 'Bisa. Kirim file desain atau referensi visual. Tim akan memeriksa kesiapan file dan menyesuaikannya dengan kebutuhan produksi.' },
      { question: 'Bisakah setiap jersey memakai nama dan nomor berbeda?', answer: 'Bisa dikonsultasikan. Siapkan daftar nama, nomor, dan ukuran dalam format yang rapi agar mudah diperiksa sebelum produksi.' },
      { question: 'Apakah ada minimal pemesanan?', answer: 'Jumlah minimal bergantung pada model, bahan, dan metode produksi. Admin akan mengonfirmasi setelah menerima detail kebutuhan.' },
      { question: 'Bagaimana menentukan ukuran?', answer: 'Gunakan size chart yang dikirim admin dan cocokkan dengan ukuran badan atau jersey yang biasa dipakai. Hindari hanya menebak ukuran.' },
    ],
    relatedProductKeys: ['dtf'],
    whatsappMessage: 'Halo Pixelso, saya ingin konsultasi jersey custom untuk tim/komunitas. Jumlah dan kebutuhan saya adalah:',
  },
  {
    slug: 'cetak-undangan',
    title: 'Cetak Undangan Gemolong & Sragen',
    description: 'Konsultasi cetak undangan pernikahan, khitan, ulang tahun, syukuran, dan acara lain di Gemolong serta Sragen. Pixelso membantu pengecekan data, desain, bahan, jumlah, dan kebutuhan pelengkap.',
    eyebrow: 'Undangan untuk momen penting',
    heroTitle: 'Cetak Undangan di Gemolong, Sragen',
    intro: 'Undangan membawa informasi penting dan sering menjadi kesan pertama sebuah acara. Pixelso membantu menyiapkan undangan untuk pernikahan, khitan, ulang tahun, syukuran, rapat, dan kegiatan lainnya dengan alur pengecekan nama, tanggal, lokasi, susunan acara, desain, serta jumlah sebelum dicetak.',
    benefits: [
      { title: 'Data diperiksa sebelum cetak', text: 'Nama, tanggal, waktu, alamat, dan informasi acara diperiksa bersama untuk mengurangi salah cetak.' },
      { title: 'Pilihan sesuai kebutuhan acara', text: 'Bentuk, ukuran, bahan, jumlah, dan finishing dibahas berdasarkan gaya acara dan anggaran.' },
      { title: 'Bisa membawa desain sendiri', text: 'File dari Canva atau desainer dapat dicek kesiapan cetaknya sebelum diproses.' },
    ],
    process: [
      'Kirim jenis acara, jumlah, tanggal acara, data undangan, dan referensi desain.',
      'Admin mengonfirmasi ukuran, bahan, finishing, kelengkapan data, biaya, dan jadwal.',
      'Proof desain diperiksa dan disetujui pemesan sebelum cetak massal.',
      'Pesanan dicetak, dicek, lalu diserahkan sesuai kesepakatan.',
    ],
    faqs: [
      { question: 'Apakah bisa cetak undangan dari desain Canva?', answer: 'Bisa. Kirim tautan atau file PDF Print dari Canva. Tim akan mengecek ukuran, bleed, kualitas gambar, dan keterbacaan teks.' },
      { question: 'Apakah Pixelso menerima undangan selain pernikahan?', answer: 'Bisa untuk khitan, ulang tahun, syukuran, rapat, wisuda, dan kegiatan lain. Sampaikan jenis acara saat konsultasi.' },
      { question: 'Kapan data undangan harus dikunci?', answer: 'Sebelum cetak massal, seluruh nama, tanggal, waktu, alamat, peta, dan nomor kontak harus disetujui pemesan agar tidak terjadi salah informasi.' },
      { question: 'Berapa lama proses cetak undangan?', answer: 'Waktu bergantung pada jumlah, bahan, finishing, kesiapan desain, dan antrean. Sebaiknya konsultasi jauh sebelum tanggal penyebaran.' },
    ],
    relatedProductKeys: ['a3-kertas-2sisi', 'laser'],
    whatsappMessage: 'Halo Pixelso, saya ingin konsultasi cetak undangan. Jenis acara, jumlah, dan tanggal kebutuhan saya adalah:',
  },
  {
    slug: 'cetak-kemasan',
    title: 'Cetak Kemasan UMKM Gemolong & Sragen',
    description: 'Konsultasi cetak kemasan dan label produk UMKM di Gemolong serta Sragen. Bahas ukuran, bahan, jumlah, desain, informasi produk, dan bentuk kemasan bersama Pixelso sebelum produksi.',
    eyebrow: 'Kemasan yang membantu produk lebih siap dijual',
    heroTitle: 'Cetak Kemasan dan Label UMKM di Sragen',
    intro: 'Kemasan perlu melindungi produk sekaligus menyampaikan merek dan informasi penting dengan jelas. Pixelso membantu UMKM Gemolong dan Sragen menyiapkan kebutuhan label, stiker, sleeve, hang tag, kartu ucapan, atau elemen cetak kemasan lain berdasarkan ukuran produk, cara pemakaian, jumlah, dan desain.',
    benefits: [
      { title: 'Disesuaikan dengan produk', text: 'Ukuran dan bahan dibahas berdasarkan bentuk produk, permukaan kemasan, penyimpanan, dan cara penggunaannya.' },
      { title: 'Mendukung identitas merek', text: 'Logo, warna, informasi produk, kontak, dan elemen visual disusun agar kemasan lebih konsisten.' },
      { title: 'Bisa mulai dari label dan elemen cetak', text: 'Untuk UMKM yang belum siap membuat kemasan penuh, kebutuhan dapat dimulai dari label, segel, sleeve, atau kartu pelengkap.' },
    ],
    process: [
      'Kirim foto produk, ukuran kemasan, jumlah, isi informasi, dan referensi desain.',
      'Admin membantu menentukan produk cetak yang relevan, bahan, ukuran, biaya, dan jadwal.',
      'Sampel visual atau proof diperiksa sebelum produksi sesuai kebutuhan.',
      'Hasil dicetak dan dicek sebelum diambil atau dikirim.',
    ],
    faqs: [
      { question: 'Apakah Pixelso mencetak kemasan makanan?', answer: 'Kebutuhan label dan elemen cetak kemasan makanan bisa dikonsultasikan. Sampaikan jenis produk, kondisi penyimpanan, dan kontak langsung atau tidak langsung dengan makanan agar bahan dapat dipertimbangkan dengan tepat.' },
      { question: 'Apa yang perlu disiapkan untuk desain kemasan?', answer: 'Siapkan logo, nama produk, varian, berat atau isi, komposisi, kontak, izin yang relevan, ukuran bidang cetak, serta referensi gaya.' },
      { question: 'Apakah bisa hanya mencetak stiker label?', answer: 'Bisa. Pixelso memiliki beberapa pilihan produk stiker; admin akan membantu memilih berdasarkan permukaan, ukuran, dan penggunaan.' },
      { question: 'Apakah tersedia bantuan desain?', answer: 'Bisa dikonsultasikan. Biaya dan waktu desain bergantung pada kelengkapan materi serta tingkat kerumitan.' },
    ],
    relatedProductKeys: ['stikerlabel', 'a3-stiker', 'sticker'],
    whatsappMessage: 'Halo Pixelso, saya ingin konsultasi cetak kemasan/label UMKM. Produk, ukuran, dan jumlah kebutuhan saya adalah:',
  },
  {
    slug: 'neonbox-reklame',
    title: 'Neon Box & Reklame Gemolong, Sragen',
    description: 'Konsultasi neon box, papan nama, dan kebutuhan reklame untuk toko atau usaha di Gemolong serta Sragen. Bahas lokasi pemasangan, ukuran, desain, bahan, pencahayaan, rangka, dan instalasi bersama Pixelso.',
    eyebrow: 'Papan nama agar usaha lebih mudah ditemukan',
    heroTitle: 'Neon Box dan Reklame di Gemolong, Sragen',
    intro: 'Neon box dan papan nama harus terbaca, sesuai identitas usaha, serta direncanakan berdasarkan lokasi pemasangan. Pixelso membantu konsultasi kebutuhan visual toko mulai dari ukuran bidang, desain, bahan cetak atau potong, rangka, pencahayaan, sampai kebutuhan pemasangan sebelum biaya dan jadwal ditentukan.',
    benefits: [
      { title: 'Perencanaan sesuai lokasi', text: 'Ukuran, arah pandang, jarak baca, kondisi luar ruang, dan titik pemasangan dibahas sebelum produksi.' },
      { title: 'Desain mudah dibaca', text: 'Nama usaha, logo, warna, dan kontak disusun dengan mempertimbangkan keterbacaan siang maupun malam.' },
      { title: 'Kebutuhan dibuat lebih jelas', text: 'Bahan muka, rangka, pencahayaan, cetak backlite, laser cutting, dan pemasangan dikonfirmasi sesuai proyek.' },
    ],
    process: [
      'Kirim foto lokasi, ukuran perkiraan, tulisan, logo, dan referensi model melalui WhatsApp.',
      'Admin menilai apakah perlu survei atau pengukuran lanjutan serta mengonfirmasi spesifikasi.',
      'Desain dan rincian biaya disetujui sebelum proses produksi.',
      'Produksi dan pemasangan dijadwalkan sesuai kesiapan lokasi dan kesepakatan.',
    ],
    faqs: [
      { question: 'Apa yang perlu dikirim untuk konsultasi neon box?', answer: 'Kirim foto lokasi dari depan, ukuran bidang, alamat pemasangan, tulisan atau logo, serta contoh model yang disukai.' },
      { question: 'Apakah tersedia jasa desain?', answer: 'Bisa dikonsultasikan. Desain harus mempertimbangkan ukuran nyata, keterbacaan, struktur, dan metode produksi.' },
      { question: 'Apakah perlu survei lokasi?', answer: 'Untuk proyek tertentu, survei atau pengukuran dapat diperlukan agar ukuran, listrik, akses pemasangan, dan kondisi bangunan tidak hanya berdasarkan perkiraan.' },
      { question: 'Berapa harga neon box atau reklame?', answer: 'Biaya bergantung pada ukuran, model, bahan, rangka, lampu, desain, lokasi, dan pemasangan. Admin akan menyusun estimasi setelah spesifikasi cukup jelas.' },
    ],
    relatedProductKeys: ['banner-kain', 'laser', 'banner'],
    whatsappMessage: 'Halo Pixelso, saya ingin konsultasi neon box/reklame. Berikut foto lokasi, ukuran perkiraan, dan desain yang saya butuhkan:',
  },
];

export function getLandingPage(slug) {
  return LANDING_PAGES.find((page) => page.slug === slug) || null;
}
