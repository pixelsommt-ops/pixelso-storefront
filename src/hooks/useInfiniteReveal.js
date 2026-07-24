import { useEffect, useRef, useState } from 'react';

// Endless scroll ringan tanpa perlu API berpaginasi - katalog di-fetch penuh sekali (seperti
// sebelumnya), lalu ditampilkan bertahap per `step` item, nambah otomatis saat sentinel di
// bawah grid kelihatan di layar (IntersectionObserver), gaya marketplace.
export default function useInfiniteReveal(total, step = 10) {
  const [visibleCount, setVisibleCount] = useState(Math.min(step, total));
  const sentinelRef = useRef(null);

  useEffect(() => {
    setVisibleCount(Math.min(step, total));
  }, [total, step]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || visibleCount >= total) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(c + step, total));
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [total, step, visibleCount]);

  return { visibleCount, sentinelRef };
}
