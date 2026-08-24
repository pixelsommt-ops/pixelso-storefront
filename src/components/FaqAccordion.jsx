import { useState } from 'react';

const FAQS = [
  {
    q: 'Berapa lama proses pengerjaan pesanan?',
    a: 'Tergantung jenis dan jumlah produk - umumnya 1-3 hari kerja untuk produk reguler. Estimasi lebih pasti akan dikonfirmasi tim kami setelah pesanan diverifikasi.',
  },
  {
    q: 'Apakah bisa upload desain sendiri?',
    a: 'Bisa. Saat checkout Anda bisa lampirkan file desain langsung, atau kirim menyusul via WhatsApp kalau belum siap.',
  },
  {
    q: 'Metode pembayaran apa saja yang diterima?',
    a: 'Saat ini pembayaran lewat transfer bank - upload bukti transfer saat checkout, tim kami verifikasi manual secepatnya.',
  },
  {
    q: 'Apakah ada minimal jumlah pemesanan?',
    a: 'Sebagian besar produk bisa dipesan satuan. Kalau butuh jumlah besar, harga per pcs biasanya lebih hemat - cek kalkulator harga di halaman tiap produk.',
  },
  {
    q: 'Bagaimana cara pengambilan atau pengiriman pesanan?',
    a: 'Pesanan bisa diambil langsung di toko, atau dikirim - detail ongkir dan jadwal akan dikonfirmasi tim kami setelah pesanan diproses.',
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="faq-list">
      {FAQS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.q} className={`faq-item ${isOpen ? 'faq-item-open' : ''}`}>
            <button
              type="button"
              className="faq-question"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              aria-expanded={isOpen}
            >
              <span>{item.q}</span>
              <span className="faq-icon">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <p className="faq-answer">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
