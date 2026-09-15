# Handoff — SEO Ekosistem Digital Pixelso

Terakhir diperbarui: 15 September 2026
Status: prerender SUDAH LIVE di produksi. Aman ditinggal.

---

## Ringkasan singkat

Menjalankan Bulan 1 dari `~/Downloads/strategi-ekosistem-digital-pixelso.md`
(audit SEO teknis). Menemukan 2 masalah besar, memperbaiki yang terbesar,
sudah dideploy dan diverifikasi di situs live.

---

## SUDAH SELESAI

### 1. Audit SEO teknis cetakpixelso.com
Temuan utama: 31 dari 32 URL mengirim canonical ke homepage, dan seluruh
halaman mengirim `<body>` kosong ke crawler. Akibatnya halaman produk &
artikel praktis tidak bisa ranking sendiri.

Bukan cloaking — Googlebot dan browser biasa menerima byte yang sama.
Murni SPA client-side.

### 2. Prerender — SUDAH LIVE
Commit `6dd9666` di branch `feat/seo-product-schema`.
File baru: `scripts/prerender.mjs`, script baru `npm run build:seo`.

Hasil terukur di produksi:

| Metrik                | Sebelum | Sesudah |
|-----------------------|---------|---------|
| Canonical salah       | 31      | 0       |
| Halaman ada isinya    | 0       | 31      |
| Ukuran /produk/dtf    | 8.681 b | 50.832 b|
| Body untuk Googlebot  | 0 ch    | 3.663 ch|

Tidak ada yang rusak: WhatsApp preview 1.664 b, Facebook 1.622 b,
pengguna biasa tetap dapat SPA penuh, `verify-production-schema.mjs`
SEMUA LOLOS DI PRODUCTION.

Backup produksi: `dist.bak_20260915_064422`
Rollback: lihat `docs/DEPLOY.md` bagian Rollback.

### 3. Detektor prerender basi — TERPASANG
Commit `0edf975`. File: `scripts/check-prerender-drift.mjs`

Masalah yang ditemukan setelah deploy: prerender itu snapshot saat build,
tapi sitemap production diperbarui tiap 6 jam dari data LIVE. Begitu ada
produk/artikel BARU terbit, URL-nya masuk sitemap dan diberikan ke Google
padahal belum diprerender — diam-diam kembali ke kondisi rusak.

Terbukti: URL produk belum diprerender dapat 8.681 b + canonical homepage.
Yang sudah diprerender dapat 50.112 b + canonical benar.

Detektor sudah diuji dua arah (32 sehat / 0 basi, dan URL palsu terdeteksi
basi). Terpasang sebagai cron mingguan Senin 09:00, job `b7d6139481ba`,
diam kalau sehat.

**KONSEKUENSI OPERASIONAL PENTING:**
Setiap menerbitkan produk/artikel baru lewat ERP, WAJIB `npm run build:seo`
+ deploy ulang. Kalau tidak, halaman baru itu tidak akan bisa ranking.

### 4. Perbaikan skill
- Skill baru `pixelso-digital-ecosystem` — doktrin strategi, termuat otomatis.
- `local-business-seo/scripts/audit-spa-seo.sh` — diperbaiki bug `sed`
  per-baris yang melaporkan EMPTY-BODY palsu untuk HTML multi-baris.
  Sempat hampir membuat saya salah lapor bahwa deploy gagal.
- `local-business-seo/SKILL.md` — ditambah pola prerender + 2 jebakannya.

### 5. Kebersihan VPS
Backup menumpuk 19 folder. Dirapikan jadi 3 terbaru saja
(`dist.bak_20260914_130906`, `_134719`, `_20260915_064422`). 78M -> 71M.
Diverifikasi dist + prerender tetap utuh setelah pembersihan.

---

## BELUM DIKERJAKAN — lanjutan di sini

### Prioritas tinggi
1. **Search Console** — minta recrawl 31 halaman supaya efeknya cepat
   terlihat. Tanpa ini perlu berminggu-minggu.
   **BUTUH ANDA:** tidak ada kredensial Google di sistem (`gws` CLI tidak
   terpasang, tidak ada client_secret). Harus login manual di
   search.google.com/search-console, atau siapkan service account dulu.

### Prioritas menengah
3. **Halaman `/portfolio/` — SUDAH PINDAH KE ERP (15 Sep 2026).**

   Rencana lama (isi `src/data/portfolio.js` manual) DIBATALKAN atas
   permintaan pemilik: file mentah merepotkan saat update, dan tidak ada
   tempat mencatat persetujuan pelanggan.

   Sekarang portofolio diinput karyawan lewat ERP, menu "Portofolio",
   dengan gerbang izin pelanggan wajib sebelum tayang. Sudah live.

   **Yang tersisa (Tahap B):** storefront masih membaca file statis
   `src/data/portfolio.js`. Perlu diubah agar ambil dari API ERP:

   ```
   GET /api/storefront/portfolio        daftar (hanya published)
   GET /api/storefront/portfolio/:slug  detail
   ```

   Endpoint sudah live & terverifikasi. Langkah lengkap ada di
   `pixelso-erp/docs/development/HANDOFF-PORTFOLIO.md` bagian TAHAP B.

   Berkas storefront yang perlu disentuh: `src/services/portfolioService.js`
   (baru), `src/pages/Portfolio.jsx`, `src/pages/PortfolioDetail.jsx`,
   `src/components/SubNav.jsx`, `scripts/generate-sitemap.mjs`, lalu
   HAPUS `src/data/portfolio.js`.

4. **5 landing page yang belum ada**: sablon kaos custom, jersey custom,
   cetak undangan, cetak kemasan, neonbox reklame.
   (Sudah ada 20 halaman produk; skor target strategi 7/13.)
5. **Seragamkan handle** — TikTok masih `@kreasi.umkm.solo`, YouTube
   `@PixelsoTV`. Strategi minta `@cetakpixelso` di semua kanal.
   Setelah diganti, perbarui `sameAs` di `index.html`.
6. **Amankan username** `@cetakpixelso` di X dan Threads.

### Catatan teknis
- Homepage sengaja TIDAK diprerender. `dist/index.html` merangkap fallback
  SPA; kalau diisi HTML homepage, keranjang/checkout/login akan berkedip.
  Untuk memprerender homepage perlu ubah nginx (fallback ke app-shell
  terpisah) — itu Protected Zone, butuh persetujuan pemilik.
- Konten masih 4 artikel. Target Bulan 2: 3 artikel + 3 portfolio per minggu.

---

## Cara lanjut di sesi berikutnya

Cukup bilang "lanjut SEO Pixelso" — skill `pixelso-digital-ecosystem` dan
`local-business-seo` akan termuat otomatis. Baca file ini untuk status.

Verifikasi cepat bahwa produksi masih sehat:

```bash
bash ~/.hermes/skills/productivity/local-business-seo/scripts/audit-spa-seo.sh https://cetakpixelso.com
# harus: canonical mismatches 0, empty body 1 (cuma homepage, memang disengaja)

cd ~/projects/pixelso-storefront && node scripts/verify-production-schema.mjs
```
