# PANDUAN UPLOAD ARTIKEL KE ERP PIXELSO

## 1. Cara Login ke ERP Admin

**URL:** https://erp.cetakpixelso.com

**Langkah-langkah:**
1. Buka browser dan akses: https://erp.cetakpixelso.com
2. Klik tombol **Login** atau langsung masuk ke halaman login
3. Masukkan kredensial admin:
   - Email: `pixelso.mmt@gmail.com`
   - Password: (password admin ERP)
4. Klik **Login**

---

## 2. Cara Upload Artikel Satu Per Satu (Manual)

Setelah login:

### Langkah 1: Akses Menu Blog
1. Di sidebar kiri, klik menu **Blog** atau **Artikel**
2. Klik tombol **+ Tambah Artikel** atau **Create New**

### Langkah 2: Isi Data Artikel
Isi form dengan data dari file `.md`:

| Field | Isi |
|-------|-----|
| **Judul** | Copy dari `title` di file `.md` |
| **Slug** | Copy dari `slug` (format: `percetakan-terdekat-gemolong`) |
| **Konten** | Copy isi `<p>...</p>` dari `content` |
| **Cover Image** | Upload file atau gunakan URL |
| **Status** | Pilih **Published** |

### Langkah 3: Upload Cover Image
1. Jika ada file gambar lokal, klik **Upload** → Pilih file
2. Atau gunakan URL yang sudah ada:
   ```
   https://www.cetakpixelso.com/uploads/photo-1784070822284-6a34b2a944c1-resto-ceria-515x328pixel.webp
   ```

### Langkah 4: Simpan Artikel
1. Klik tombol **Simpan** atau **Publish**
2. Tunggu hingga muncul notifikasi berhasil

---

## 3. Daftar Artikel yang Sudah Dibuat

Berikut 6 artikel yang siap diupload:

### Artikel 1: Harga Cetak Banner di Sragen
- **Slug:** `harga-cetak-banner-sragen`
- **File:** `docs/artikel/01-harga-cetak-banner-sragen.md`
- **Isi:** Panduan harga banner di Sragen dengan tabel harga

### Artikel 2: Percetakan Terdekat di Gemolong
- **Slug:** `percetakan-terdekat-gemolong`
- **File:** `docs/artikel/02-percetakan-terdekat-gemolong.md`
- **Isi:** Alamat Pixelso Gemolong dan layanan yang tersedia

### Artikel 3: Harga Cetak Stiker di Sragen
- **Slug:** `harga-cetak-stiker-sragen`
- **File:** `docs/artikel/03-harga-cetak-stiker-sragen.md`
- **Isi:** Harga stiker vinyl, transparent, dan label produk

### Artikel 4: Cetak Kartu Nama di Sragen
- **Slug:** `cetak-kartu-nama-sragen`
- **File:** `docs/artikel/04-cetak-kartu-nama-sragen.md`
- **Isi:** Package kartu nama dengan harga mulai Rp55.000

### Artikel 5: Cetak Kaos DTF Satuan di Sragen
- **Slug:** `cetak-kaos-dtf-sragen`
- **File:** `docs/artikel/05-cetak-kaos-dtf-sragen.md`
- **Isi:** Layanan DTF satuan tanpa minimum order

### Artikel 6: Bikin Merchandise Custom di Sragen
- **Slug:** `merchandise-custom-sragen`
- **File:** `docs/artikel/06-merchandise-custom-sragen.md`
- **Isi:** Mug, lanyard, pin, jam dinding custom

---

## 4. Cara Upload via Script (Otomatis)

### Prerequisites:
- Node.js 18+
- Email & password admin ERP

### Langkah:

1. **Siapkan environment variables:**
```bash
export ERP_ADMIN_EMAIL="pixelso.mmt@gmail.com"
export ERP_ADMIN_PASSWORD="your_password_here"
```

2. **Jalankan script upload:**
```bash
cd /home/muflih/projects/pixelso-storefront/docs/artikel
node upload-articles-to-erp.mjs
```

3. **Script akan:**
   - Login ke ERP
   - Upload cover image (jika ada)
   - Buat artikel satu per satu
   - Menampilkan summary sukses/gagal

---

## 5. Verifikasi Upload

Setelah upload:

1. **Cek di frontend:**
   - Buka: https://www.cetakpixelso.com/blog
   - Pastikan artikel muncul

2. **Cek SEO:**
   - Buka: https://www.cetakpixelso.com/blog/[slug]
   - Cek meta title, description
   - Test Open Graph: https://developers.facebook.com/tools/debug/

3. **Cek Google Search Console:**
   - Request indexing untuk semua artikel baru

---

## 6. Troubleshooting

### Error: "Failed to login"
- Pastikan email & password benar
- Cek apakah akun admin masih aktif

### Error: "Cover upload failed"
- Pastikan file gambar ada di folder yang sesuai
- Coba gunakan URL langsung dari sitemap

### Artikel tidak muncul di frontend
- Cek status artikel (harus "Published")
- Cek slug tidak ada konflik
- Clear cache frontend jika perlu

---

## 7. Tips

- Upload 1-2 artikel dulu untuk test
- Cek tampilan di mobile (responsive)
- Paste konten HTML ke ERP, bukan markdown
- Simpan slug yang konsisten untuk SEO

---

**Contact:** Jika ada masalah, hubungi tim IT Pixelso.
