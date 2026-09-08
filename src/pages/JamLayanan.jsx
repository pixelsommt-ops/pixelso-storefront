import useSiteSettingsStore from '../store/siteSettingsStore';
import { waLink } from '../lib/business';
import { trackContact } from '../lib/analytics';
import Seo from '../components/Seo';

export default function JamLayanan() {
  const business = useSiteSettingsStore((s) => s.settings);

  return (
    <div className="section container">
      <Seo title="Jam Layanan" description="Kapan Pixelso Gemolong buka dan bisa dihubungi untuk konsultasi cetak." path="/jam-layanan" />
      <div className="section-head">
        <h1>Jam Layanan</h1>
        <p className="text-muted">Kapan Pixelso buka dan bisa dihubungi untuk konsultasi cetak.</p>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        <h3>{business.openingHours}</h3>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>{business.address}</p>
        {business.whatsapp && (
          <a
            href={waLink(business.whatsapp, 'Halo Pixelso, saya mau tanya jam layanan.')}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{ marginTop: '1rem', display: 'inline-flex' }}
            onClick={() => trackContact('jam_layanan_page')}
          >
            Tanya via WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
