const STEPS = [
  { title: 'Pilih Produk', desc: 'Tentukan ukuran, bahan, dan finishing di halaman produk.' },
  { title: 'Masuk / Daftar', desc: 'Buat akun singkat supaya pesanan bisa dipantau.' },
  { title: 'Upload Desain', desc: 'Lampirkan file cetak, atau lewati dan kirim via WhatsApp nanti.' },
  { title: 'Checkout & Transfer', desc: 'Bayar via transfer bank, upload bukti pembayaran.' },
  { title: 'Diproses & Diambil', desc: 'Tim kami verifikasi, cetak, lalu siap diambil/dikirim.' },
];

export default function CaraPesanSteps() {
  return (
    <div className="steps">
      {STEPS.map((step, index) => (
        <div key={step.title} className="card card-sm">
          <div className="step-num">{index + 1}</div>
          <h3 style={{ fontSize: '0.95rem' }}>{step.title}</h3>
          <p className="text-muted" style={{ fontSize: '0.82rem', margin: 0 }}>{step.desc}</p>
        </div>
      ))}
    </div>
  );
}
