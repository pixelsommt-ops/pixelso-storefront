import useSiteSettingsStore from '../store/siteSettingsStore';
import RichText from '../components/RichText';
import Seo from '../components/Seo';

export default function TentangKami() {
  const business = useSiteSettingsStore((s) => s.settings);

  return (
    <div className="section container">
      <Seo title="Tentang Kami" description={business.description} path="/tentang-kami" />
      <div className="section-head">
        <h1>Tentang Kami</h1>
        <p className="text-muted">{business.tagline}</p>
      </div>
      <div className="card" style={{ maxWidth: 640 }}>
        <h3>{business.name}</h3>
        <RichText html={business.description} style={{ marginTop: '0.5rem' }} />
        <p className="text-muted" style={{ marginTop: '1rem' }}>{business.address}</p>
      </div>
    </div>
  );
}
