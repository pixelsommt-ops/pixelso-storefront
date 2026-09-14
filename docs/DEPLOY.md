# Deploy Storefront ke VPS

Storefront (`cetakpixelso.com`) TIDAK punya skrip deploy otomatis seperti pixelso-erp.
Deploy dilakukan manual: build lokal, kirim tarball, tukar folder `dist`.

## Prerender (WAJIB untuk SEO)

Storefront ini SPA client-side murni: HTML mentah yang dikirim ke crawler punya
`<body>` kosong, dan `index.html` memuat canonical statis `https://www.cetakpixelso.com/`.
Akibatnya **semua** halaman produk & blog mengaku duplikat homepage, dan Google
tidak melihat H1/harga/teks/internal link sama sekali.

`scripts/prerender.mjs` menjalankan Chrome sungguhan untuk tiap rute di
`dist/sitemap.xml`, menunggu React selesai render, lalu menyimpan hasilnya
sebagai `dist/<rute>/index.html`. Nginx sudah memakai `try_files $uri $uri/ /index.html`,
jadi file itu otomatis disajikan lebih dulu — **tidak perlu ubah konfigurasi nginx.**

Pengguna biasa tetap dapat SPA penuh (React hydrate di atas HTML tersebut).

Dua hal yang dijaga script ini:

- **`/` sengaja TIDAK diprerender.** `dist/index.html` merangkap fallback SPA
  untuk rute yang tidak diprerender (keranjang, checkout, login, profil). Kalau
  diisi HTML homepage, rute-rute itu akan berkedip menampilkan isi homepage dulu.
- **Halaman privat tidak diprerender** (`SKIP` di script): keranjang, checkout,
  pesanan, login, daftar, lupa/reset password, profil.

Butuh Chrome sistem (`/usr/bin/google-chrome`) + `puppeteer-core` (devDependency).
Sengaja bukan paket `puppeteer` penuh supaya tidak mengunduh ~200MB Chromium.

Urutan: `npm run build:seo` = **build → prerender**.

Rute diambil dari **sitemap production**, bukan `dist/sitemap.xml` lokal. Alasannya:
sitemap production dihasilkan ulang tiap 6 jam dari data LIVE, sedangkan
`dist/sitemap.xml` hasil build hanya salinan `public/sitemap.xml` di repo yang
mudah basi — memakainya berarti produk/artikel baru tidak ikut diprerender tanpa
peringatan. Script juga tidak butuh backend lokal (port 4010) menyala.

Kalau jaringan mati, script otomatis jatuh ke `dist/sitemap.xml` dan menandai
sumbernya "LOKAL - bisa basi" di output.

## JEBAKAN: deploy menimpa sitemap.xml

`sitemap.xml` di production **bukan** file statis hasil build. File itu dihasilkan ulang
tiap 6 jam oleh systemd timer (`sitemap-storefront.timer`) dari data produk/artikel LIVE,
lalu ditulis langsung ke `/opt/pixelso-storefront/dist/sitemap.xml`.

Artinya: **setiap deploy yang mengganti seluruh folder `dist` akan menimpa sitemap
dengan versi lama dari `public/sitemap.xml` di repo.** Artikel dan produk yang terbit
setelah snapshot repo itu akan hilang dari sitemap sampai timer berikutnya jalan —
bisa sampai 6 jam, dan tidak ada peringatan apa pun.

Ini pernah terjadi: artikel `harga-cetak-banner-sragen` sempat masuk sitemap
(2026-09-14 11:13), lalu hilang setelah deploy 11:44, dan baru pulih setelah
timer dipicu manual.

**Karena itu, SELALU jalankan regenerasi sitemap sebagai langkah terakhir deploy.**

## Langkah deploy

```bash
cd ~/projects/pixelso-storefront

# 1. Build + sitemap + prerender (butuh .env berisi ID tracking - lihat catatan di bawah)
npm run lint && npm run build:seo

# 2. Pastikan placeholder env sudah tergantikan (harus 0)
grep -c "%VITE_" dist/index.html

# 2b. Pastikan halaman prerender ada & shell SPA tidak terkontaminasi
find dist -name index.html | wc -l          # harus ~31 (1 shell + 30 prerender)
node -e "const f=require('fs').readFileSync('dist/index.html','utf8');
  const m=f.match(/<body[^>]*>([\s\S]*?)<\/body>/);
  const c=m?m[1].replace(/<[^>]*>/g,'').trim().length:0;
  if(c>100){console.error('GAGAL: dist/index.html terkontaminasi isi homepage');process.exit(1)}
  console.log('shell SPA OK')"

# 3. Kirim
tar -czf /tmp/dist.tgz -C dist .
scp /tmp/dist.tgz root@202.155.95.15:/tmp/dist.tgz

# 4. Tukar folder + regenerasi sitemap (SATU koneksi SSH - VPS pakai `ufw limit ssh`)
ssh root@202.155.95.15 '
  set -e
  cd /opt/pixelso-storefront
  TS=$(date +%Y%m%d_%H%M%S)
  cp -r dist "dist.bak_$TS"
  echo "BACKUP: dist.bak_$TS"

  rm -rf dist.new && mkdir dist.new
  tar -xzf /tmp/dist.tgz -C dist.new

  # Pre-check: batalkan sebelum menyentuh dist lama kalau ada yang hilang
  test -f dist.new/index.html            || { echo "GAGAL: index.html"; exit 1; }
  test -d dist.new/assets                || { echo "GAGAL: assets"; exit 1; }
  grep -q "G-TMDSKGJQMX"  dist.new/index.html || { echo "GAGAL: GA4 hilang"; exit 1; }
  grep -q "AW-873876640"  dist.new/index.html || { echo "GAGAL: Google Ads hilang"; exit 1; }
  grep -q "167839573723146" dist.new/index.html || { echo "GAGAL: Meta Pixel hilang"; exit 1; }
  grep -q "D9SABU3C77U6RO6J56A0" dist.new/index.html || { echo "GAGAL: TikTok Pixel hilang"; exit 1; }
  echo "PRE-CHECK OK"

  rm -rf dist.old && mv dist dist.old && mv dist.new dist
  chown -R pixelsoerp:pixelsoerp dist
  rm -rf dist.old

  # WAJIB: build menimpa sitemap dengan versi lama dari repo.
  systemctl start sitemap-storefront.service
  sleep 5
  grep -c "<loc>" dist/sitemap.xml
'
```

## Verifikasi setelah deploy

```bash
# Halaman kunci
for p in / /katalog /blog /produk/banner /keranjang /login; do
  echo -n "$p -> "; curl -sSL -o /dev/null -w '%{http_code}\n' "https://www.cetakpixelso.com$p"
done

# Sitemap memuat artikel terbaru
curl -sSL https://www.cetakpixelso.com/sitemap.xml | grep -oP '(?<=<loc>).*?(?=</loc>)' | grep blog

# Googlebot dapat SPA penuh (bukan meta HTML kosong)
curl -sSL -A "Mozilla/5.0 (compatible; Googlebot/2.1)" \
  https://www.cetakpixelso.com/produk/banner -o /dev/null -w 'googlebot=%{size_download}\n'
# Harus ~8600 byte. Kalau ~1600 byte, Googlebot kena rute meta HTML - cek
# /etc/nginx/conf.d/social-bots.conf, pastikan Googlebot & bingbot TIDAK ada di sana.

# Preview WhatsApp masih utuh
curl -sSL -A "WhatsApp/2.23" \
  https://www.cetakpixelso.com/produk/banner -o /dev/null -w 'whatsapp=%{size_download}\n'
# Harus ~1600 byte (meta HTML) - ini memang perilaku yang benar untuk bot sosial.

# Schema production
node scripts/verify-production-schema.mjs
node scripts/audit-production-schema.mjs
```

## Catatan `.env`

`.env` di-gitignore, jadi tidak ikut di repo. Tanpa file itu, build menghasilkan
placeholder literal `%VITE_GA_MEASUREMENT_ID%` dan **seluruh tracking mati**
(GA4, Google Ads, Meta Pixel, TikTok Pixel) tanpa error apa pun.

Nilai yang dipakai production bisa dipulihkan dari `index.html` live dan bundle JS live.
Isi minimal:

```
VITE_API_BASE_URL=/api/storefront
VITE_GA_MEASUREMENT_ID=G-TMDSKGJQMX
VITE_GOOGLE_ADS_CONVERSION_ID=AW-873876640
VITE_GOOGLE_ADS_CONVERSION_LABEL=qT4YCOL87N4cEKCZ2aAD
VITE_META_PIXEL_ID=167839573723146
VITE_TIKTOK_PIXEL_ID=D9SABU3C77U6RO6J56A0
VITE_GOOGLE_CLIENT_ID=
VITE_PASSWORD_RESET_ENABLED=
```

Dua yang terakhir sengaja kosong — itu kondisi production (tombol login Google tidak
dirender, fitur "Lupa password?" aktif).

## Rollback

```bash
ssh root@202.155.95.15 '
  cd /opt/pixelso-storefront
  rm -rf dist && cp -r dist.bak_TIMESTAMP dist
  chown -R pixelsoerp:pixelsoerp dist
  systemctl start sitemap-storefront.service
'
```

Ganti `TIMESTAMP` dengan backup yang diinginkan (`ls -d dist.bak_*`).
