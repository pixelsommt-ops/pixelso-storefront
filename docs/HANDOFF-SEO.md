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

### 3. Perbaikan skill
- Skill baru `pixelso-digital-ecosystem` — doktrin strategi, termuat otomatis.
- `local-business-seo/scripts/audit-spa-seo.sh` — diperbaiki bug `sed`
  per-baris yang melaporkan EMPTY-BODY palsu untuk HTML multi-baris.
  Sempat hampir membuat saya salah lapor bahwa deploy gagal.

---

## BELUM DIKERJAKAN — lanjutan di sini

### Prioritas tinggi
1. **Push branch `feat/seo-product-schema`** — 14 commit masih LOKAL saja,
   belum ada di origin. Produksi sudah jalan dari build branch ini.
   Risiko kehilangan kerjaan kalau disk bermasalah.
   `git push -u origin feat/seo-product-schema`
2. **Search Console** — minta recrawl 31 halaman supaya efeknya cepat
   terlihat. Tanpa ini perlu berminggu-minggu.

### Prioritas menengah
3. **Halaman `/portfolio/`** — belum ada sama sekali. Strategi menyebutnya
   "mesin SEO" utama. Pola URL: `/portfolio/banner-kokurikuler-sekolah-sragen/`
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
