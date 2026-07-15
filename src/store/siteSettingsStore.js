import { create } from 'zustand';
import * as settingsService from '../services/settingsService';
import { DEFAULT_BUSINESS } from '../lib/business';

// Identitas bisnis (alamat, sosmed, deskripsi, foto hero/galeri) sekarang datang dari ERP,
// bukan hardcode - lihat backend/src/modules/settings. Fallback ke DEFAULT_BUSINESS supaya
// halaman tidak pernah kosong sebelum fetch selesai atau kalau ERP tidak terjangkau.
const useSiteSettingsStore = create((set, get) => ({
  settings: DEFAULT_BUSINESS,
  loaded: false,

  fetchSettings: async () => {
    if (get().loaded) return;
    try {
      const { data } = await settingsService.getSettings();
      set({ settings: { ...DEFAULT_BUSINESS, ...data }, loaded: true });
    } catch (err) {
      console.warn('Gagal memuat pengaturan situs, pakai default:', err.message);
      set({ loaded: true });
    }
  },
}));

export default useSiteSettingsStore;
