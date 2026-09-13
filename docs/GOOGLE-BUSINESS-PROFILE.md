# Google Business Profile — Optimasi Pixelso

Disusun 13 September 2026. Basis: pemeriksaan langsung profil Maps live.

---

## KOREKSI PENTING

Aku sebelumnya menyarankan "daftarkan Google Business Profile" seolah kamu belum punya. **Itu keliru.** Setelah aku cek link Maps di footer websitemu, ternyata profilnya sudah lama aktif dan performanya jauh di atas rata-rata.

Kondisi live saat diperiksa:

```
Nama          Percetakan Pixelso
Kategori      Percetakan Komersial
Alamat        Dusun 1, Gemolong, Kec. Gemolong, Kab. Sragen, Jawa Tengah 50274
Plus Code     JR2G+QH Gemolong
Telepon       0815-6609-299
Website       cetakpixelso.com
Jam           Buka Senin 08.00
Rating        4,8 dari 340 ulasan
Foto          264+
```

Distribusi ulasan:

| Bintang | Jumlah |
|---|---|
| 5 | 301 |
| 4 | 20 |
| 3 | 9 |
| 2 | 6 |
| 1 | 4 |

88,5% memberi bintang 5. Kamu juga membalas ulasan — aku lihat balasan pemilik pada ulasan 3 bulan lalu. Itu kebiasaan yang benar dan sudah jalan.

**Jadi ini bukan panduan mendaftar. Ini panduan mengoptimalkan aset yang sudah kuat.**

340 ulasan dengan rating 4,8 adalah aset paling berharga dalam seluruh kehadiran digitalmu — lebih bernilai daripada semua pekerjaan SEO yang kita lakukan hari ini. Tidak ada kompetitor di Gemolong yang bisa menyamainya dalam waktu dekat.

---

## MASALAH YANG DITEMUKAN

### 1. Nama bisnis tidak konsisten — PRIORITAS TERTINGGI

```
Google Maps  : "Percetakan Pixelso"
Website      : "Pixelso DigiPrint & Creative Studio"
Schema.org   : "Pixelso DigiPrint & Creative Studio"
```

Google mencocokkan bisnis di Maps dengan website lewat kesamaan NAP (Name, Address, Phone). Nama yang berbeda melemahkan kaitan itu.

**Rekomendasi: ubah nama di website mengikuti Google Maps, bukan sebaliknya.**

Alasannya tiga:

1. "Percetakan Pixelso" mengandung kata **"percetakan"** — kata yang benar-benar diketik orang saat mencari. "DigiPrint & Creative Studio" tidak pernah diketik siapa pun di Sragen.
2. Mengubah nama di GBP berisiko memicu peninjauan ulang oleh Google, dan profil dengan 340 ulasan tidak layak dipertaruhkan.
3. Semua ulasan dan foto sudah melekat pada nama itu.

Yang perlu diubah di website: `index.html` (schema.org `name`) dan data bisnis di ERP. Bisa pakai `alternateName` untuk menyimpan "Pixelso DigiPrint & Creative Studio" agar branding tidak hilang.

### 2. Alamat: JANGAN UBAH DI GBP — pin Maps sudah benar

**Peringatan.** Saran awal di dokumen ini adalah "sarankan edit alamat di GBP". **Saran itu dicabut.** Owner mencoba mengubah alamat menjadi "Jl. Solo-Purwodadi KM.20" di GBP dan pin Maps justru bergeser ke selatan.

Setelah diperiksa, akar masalahnya kebalikan dari dugaan awal:

| | Koordinat | Hasil reverse geocode |
|---|---|---|
| **Pin Google Maps** | -7.398063, 110.826437 | Jalan Solo - Purwodadi, Gemolong, Sragen ✓ |
| **Geo lama di website** | -7.398122, 110.823852 | Ngembatpadas, Sragen ✗ (desa lain) |

Selisihnya 285 meter ke barat. **Pin Maps sudah tepat sejak awal; yang salah adalah koordinat di schema.org website.** Itu sudah diperbaiki (commit `9f5efb3`), dan Plus Code website kini cocok persis dengan Maps: `JR2G+QH`.

Kesimpulan: **jangan sentuh alamat maupun pin di GBP.** Alamat administratif di Maps ("Dusun 1, Gemolong") memang berbeda gaya dari patokan jalan di website, tapi keduanya menunjuk titik yang sama, dan Google sudah memetakan lokasinya dengan benar.

### 2b. Kode pos: 57274, bukan 50274

Panel Maps menampilkan "50274", tapi itu keliru — 50274 adalah wilayah Semarang. Kode pos Gemolong, Sragen yang benar adalah **57274**, dikonfirmasi oleh reverse geocode Nominatim dan empat sumber kode pos independen.

Website sudah memakai 57274. Kalau di GBP masih tertulis 50274, itu boleh dikoreksi — tapi lakukan **hanya lewat kolom kode pos**, jangan menyentuh baris alamat atau pin, supaya lokasinya tidak ikut bergeser.

### 3. Kategori masih tunggal

Sekarang hanya "Percetakan Komersial". GBP mengizinkan satu kategori utama plus sembilan kategori tambahan, dan tiap kategori tambahan membuka pintu pencarian baru.

Saran kategori tambahan yang cocok dengan katalogmu:

- Toko spanduk (banner, MMT, banner kain)
- Layanan desain grafis (desain gratis sudah jadi nilai jualmu)
- Toko suvenir (mug, lanyang, pin, jam dinding)
- Layanan sablon kaos (DTF)
- Toko stiker
- Layanan fotokopi

Kategori tambahan tidak mengubah kategori utama dan risikonya kecil.

### 4. Produk & layanan kemungkinan belum diisi

GBP punya fitur "Produk" yang menampilkan katalog lengkap dengan harga langsung di Maps. Untuk percetakan dengan 20 produk aktif, ini peluang besar yang jarang dipakai kompetitor.

Data harga sudah tersedia dan terverifikasi di katalogmu:

| Produk | Harga | Link |
|---|---|---|
| Banner / MMT Outdoor | Rp20.000/m² | /produk/banner |
| Stiker Indoor | Rp85.000/m² | /produk/sticker |
| Banner Kain | Rp50.000/m² | /produk/banner-kain |
| Paket Banner Siap Pasang | Rp75.000 | /produk/banner-paket |
| Cetak Kartu Nama | Rp55.000 | /produk/kartu-nama |
| DTF Kaos | Rp55.000 | /produk/dtf |
| Mug Custom | Rp20.000 | /produk/mug |
| Lanyard Custom | Rp12.000 | /produk/lanyard |
| Pin & Ganci | Rp5.500 | /produk/pinganci |
| Jam Dinding Custom | Rp85.000 | /produk/jamdinding |
| Stiker Label | Rp9.000 | /produk/stikerlabel |
| Cetak Nota | Rp155.000/rim | /produk/nota |
| Cetak Stempel | Rp45.000 | /produk/stempel |
| Paket Brosur 1 Rim | Rp230.000 | /produk/brosur |

Setiap produk di GBP bisa diberi tautan langsung ke halaman produknya. Ini mengalirkan trafik dari Maps ke website, tepat ke halaman yang sudah punya schema Product sejak deploy hari ini.

---

## YANG SUDAH BENAR — JANGAN DIUBAH

- Rating 4,8 dari 340 ulasan
- Membalas ulasan pelanggan
- 264+ foto
- Nomor telepon cocok dengan website
- Website tertaut dengan benar
- Jam buka cocok dengan yang tertulis di website

---

## RENCANA TINDAKAN

### Minggu ini (dampak besar, usaha kecil)

1. **Samakan nama di website** menjadi "Percetakan Pixelso", simpan nama lama sebagai `alternateName`
2. **JANGAN ubah alamat atau pin di GBP** — pin sudah benar, koordinat website yang sudah diperbaiki. Kalau kode pos di GBP masih 50274, koreksi lewat kolom kode pos saja menjadi 57274.
3. **Tambah 4–6 kategori tambahan** di GBP

### Dua minggu ke depan

4. **Isi fitur Produk di GBP** — mulai dari 5 produk terlaris, beri tautan ke halaman produk masing-masing
5. **Aktifkan pesan/WhatsApp** kalau belum, agar orang bisa langsung menghubungi dari Maps

### Rutin setiap minggu

6. **Posting di GBP** — 1 posting per minggu. Bisa produk baru, promo, atau hasil cetak menarik. Posting muncul di Maps dan pencarian, gratis.
7. **Balas semua ulasan baru** — ini sudah kamu lakukan, pertahankan
8. **Tambah foto** — 2–3 foto per bulan, terutama hasil cetak nyata

---

## MENGAPA INI LEBIH PENTING DARIPADA ARTIKEL BLOG

Untuk percetakan lokal, urutan cara orang menemukanmu biasanya:

1. Cari "percetakan terdekat" di Google Maps → lihat rating → telepon
2. Rekomendasi mulut ke mulut
3. Media sosial
4. Pencarian Google biasa → website

Profil Maps-mu sudah menang di jalur nomor 1. Rating 4,8 dengan 340 ulasan itu benteng yang sangat sulit ditembus pesaing baru.

Yang belum optimal adalah **jembatan antara Maps dan website**. Nama yang berbeda, alamat yang berbeda, dan produk yang belum terdaftar di GBP membuat dua aset kuat ini bekerja sendiri-sendiri, bukan saling menguatkan.

Memperbaiki konsistensi NAP adalah pekerjaan satu jam dengan dampak lebih besar daripada menulis tiga artikel blog.

---

## HUBUNGAN DENGAN RENCANA KONTEN

Artikel nomor 2 dalam rencana konten ("Percetakan Terdekat di Gemolong") jadi lebih bernilai sekarang. Artikel itu bisa:

- Menyertakan tautan Maps agar pembaca langsung melihat 340 ulasan
- Menyebut rating 4,8 sebagai bukti sosial
- Memuat alamat dan Plus Code yang sama persis dengan GBP

Sebaliknya, posting GBP bisa menautkan artikel blog. Keduanya saling mengumpan.

---

## CATATAN

Aku tidak bisa mengubah GBP dari sini — profil itu butuh login akun Google pemiliknya. Semua langkah di atas harus dikerjakan dari akun yang mengelola "Percetakan Pixelso", lewat aplikasi Google Maps (menu Bisnis) atau business.google.com.

Yang bisa aku kerjakan: perubahan di sisi website (nama, alamat, kode pos di schema.org). Bilang saja kalau mau aku kerjakan.
