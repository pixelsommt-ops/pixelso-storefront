import { create } from 'zustand';
import * as catalogService from '../services/catalogService';

// Dipakai oleh SubNav (hidup di layout, tampil di semua halaman) supaya katalog
// tidak di-fetch ulang tiap pindah halaman - pola sama dengan siteSettingsStore.
const useCatalogStore = create((set, get) => ({
  products: [],
  loaded: false,

  fetchCatalog: async () => {
    if (get().loaded) return;
    try {
      const { data } = await catalogService.getCatalog();
      set({ products: data.products || [], loaded: true });
    } catch (err) {
      console.warn('Gagal memuat katalog:', err.message);
      set({ loaded: true });
    }
  },
}));

export default useCatalogStore;
