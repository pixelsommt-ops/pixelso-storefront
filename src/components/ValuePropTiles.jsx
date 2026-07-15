const ITEMS = [
  { title: 'Estimasi Harga Transparan', desc: 'Kalkulator otomatis sesuai ukuran, bahan, dan finishing.' },
  { title: 'Upload Desain Sendiri', desc: 'Lampirkan file cetak-siap saat checkout, atau kirim menyusul.' },
  { title: 'Bayar Transfer, Diverifikasi Cepat', desc: 'Upload bukti transfer, tim kami konfirmasi manual.' },
  { title: 'Pantau Status Pesanan', desc: 'Lihat progres dari menunggu verifikasi sampai siap diambil.' },
];

export default function ValuePropTiles() {
  return (
    <div className="grid grid-4">
      {ITEMS.map((item) => (
        <div key={item.title} className="card card-sm">
          <h3 style={{ fontSize: '1rem' }}>{item.title}</h3>
          <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
