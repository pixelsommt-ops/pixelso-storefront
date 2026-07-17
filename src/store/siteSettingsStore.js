import { create } from 'zustand';
import * as settingsService from '../services/settingsService';
import { DEFAULT_BUSINESS } from '../lib/business';

// Tema event aktif (lihat ERP "Tema Website") disuntikkan di sini - warna lewat CSS var
// override di :root (index.css storefront sudah pakai var --maroon-950 dkk di semua tempat,
// jadi override di satu titik ini cukup, tidak perlu ubah komponen manapun), CSS tambahan lewat
// <style> terpisah biar gampang dilepas/diganti. ID tetap supaya tidak numpuk kalau fetch ulang.
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme?.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }

  let styleTag = document.getElementById('active-theme-style');
  if (theme?.customCss) {
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'active-theme-style';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = theme.customCss;
  } else if (styleTag) {
    styleTag.remove();
  }
}

// Identitas bisnis (alamat, sosmed, deskripsi, foto hero/galeri) sekarang datang dari ERP,
// bukan hardcode - lihat backend/src/modules/settings. Fallback ke DEFAULT_BUSINESS supaya
// halaman tidak pernah kosong sebelum fetch selesai atau kalau ERP tidak terjangkau.
const useSiteSettingsStore = create((set, get) => ({
  settings: DEFAULT_BUSINESS,
  activeTheme: null,
  loaded: false,

  fetchSettings: async () => {
    if (get().loaded) return;
    try {
      const { data } = await settingsService.getSettings();
      const { activeTheme, ...rest } = data;
      // heroSlides tema (kalau diisi) menggantikan heroSlides normal selama tema itu aktif -
      // logoUrl tema dipakai StorefrontLayout kalau ada, fallback ke logo default kalau tidak.
      const merged = {
        ...DEFAULT_BUSINESS,
        ...rest,
        heroSlides: activeTheme?.heroSlides?.length > 0 ? activeTheme.heroSlides : rest.heroSlides,
        logoUrl: activeTheme?.logoUrl || null,
      };
      applyTheme(activeTheme);
      set({ settings: merged, activeTheme: activeTheme || null, loaded: true });
    } catch (err) {
      console.warn('Gagal memuat pengaturan situs, pakai default:', err.message);
      set({ loaded: true });
    }
  },
}));

export default useSiteSettingsStore;
