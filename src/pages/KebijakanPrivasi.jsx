import useSiteSettingsStore from '../store/siteSettingsStore';
import { waLink } from '../lib/business';
import Seo from '../components/Seo';

export default function KebijakanPrivasi() {
  const business = useSiteSettingsStore((s) => s.settings);

  return (
    <div className="section container">
      <Seo
        title="Kebijakan Privasi"
        description={`Kebijakan privasi ${business.name} - data apa saja yang kami kumpulkan dan bagaimana kami menggunakannya.`}
        path="/kebijakan-privasi"
      />
      <div className="section-head">
        <h1>Kebijakan Privasi</h1>
        <p className="text-muted">Terakhir diperbarui: September 2026</p>
      </div>

      <div className="card" style={{ maxWidth: 760, lineHeight: 1.7 }}>
        <p>
          {business.name} menghargai privasi Anda. Halaman ini menjelaskan data apa saja yang kami
          kumpulkan saat Anda berbelanja di situs ini, untuk apa data tersebut digunakan, dan
          dengan siapa data itu dibagikan.
        </p>

        <h3 style={{ marginTop: '1.5rem' }}>Data yang kami kumpulkan</h3>
        <ul>
          <li>
            <strong>Data pesanan</strong> - nama, nomor WhatsApp, alamat, metode pembayaran, bukti
            pembayaran, dan file desain yang Anda unggah saat checkout.
          </li>
          <li>
            <strong>Data kunjungan situs</strong> - halaman yang dikunjungi, produk yang dilihat,
            perangkat &amp; browser, serta sumber kunjungan (misalnya dari iklan Google/Facebook/
            TikTok atau pencarian organik), dikumpulkan otomatis lewat Google Analytics, Meta
            Pixel, dan TikTok Pixel.
          </li>
          <li>
            <strong>Cookie &amp; penyimpanan lokal</strong> - digunakan untuk mengingat isi
            keranjang belanja Anda dan mencatat sumber kunjungan pertama (UTM) agar laporan iklan
            kami akurat.
          </li>
        </ul>

        <h3 style={{ marginTop: '1.5rem' }}>Untuk apa data ini digunakan</h3>
        <ul>
          <li>Memproses dan mengirim pesanan Anda.</li>
          <li>Menghubungi Anda terkait status pesanan lewat WhatsApp.</li>
          <li>Mengukur efektivitas iklan dan meningkatkan pengalaman berbelanja di situs ini.</li>
          <li>Menampilkan iklan yang relevan (retargeting) kepada pengunjung yang pernah melihat produk kami.</li>
        </ul>

        <h3 style={{ marginTop: '1.5rem' }}>Berbagi data ke pihak ketiga</h3>
        <p>
          Kami menggunakan layanan analitik dan iklan pihak ketiga - Google (Analytics &amp; Ads),
          Meta (Facebook/Instagram), dan TikTok. Layanan ini menerima data kunjungan/interaksi
          (event) untuk keperluan pengukuran iklan, sesuai kebijakan privasi masing-masing
          platform. Kami tidak menjual data pribadi Anda ke pihak manapun.
        </p>

        <h3 style={{ marginTop: '1.5rem' }}>Hak Anda</h3>
        <p>
          Anda dapat menghubungi kami kapan saja untuk bertanya, mengoreksi, atau meminta
          penghapusan data pesanan Anda.
        </p>

        <h3 style={{ marginTop: '1.5rem' }}>Kontak</h3>
        <p>
          {business.whatsapp && (
            <>
              WhatsApp:{' '}
              <a href={waLink(business.whatsapp, 'Halo, saya mau tanya soal kebijakan privasi.')} target="_blank" rel="noreferrer">
                {business.whatsapp}
              </a>
              <br />
            </>
          )}
          Alamat: {business.address}
        </p>
      </div>
    </div>
  );
}
