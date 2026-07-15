import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = value.trim();
    navigate(q ? `/katalog?q=${encodeURIComponent(q)}` : '/katalog');
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar" role="search">
      <input
        type="search"
        placeholder="Mau cetak apa hari ini kak?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Cari produk"
      />
      <button type="submit" className="search-bar-btn" aria-label="Cari">
        🔍
      </button>
    </form>
  );
}
