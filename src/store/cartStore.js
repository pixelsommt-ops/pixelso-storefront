import { create } from 'zustand';

const STORAGE_KEY = 'storefront_cart';

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

let nextId = 1;

// Item cart menyimpan spesifikasi mentah (bukan harga terhitung) - harga selalu dihitung ulang
// live dari katalog terkini lewat lib/calculator.js, baik untuk tampilan maupun saat checkout.
const useCartStore = create((set, get) => ({
  items: loadCart(),

  addItem: (item) => {
    const next = [...get().items, { ...item, cartItemId: nextId++ }];
    saveCart(next);
    set({ items: next });
  },

  removeItem: (cartItemId) => {
    const next = get().items.filter((i) => i.cartItemId !== cartItemId);
    saveCart(next);
    set({ items: next });
  },

  updateItem: (cartItemId, patch) => {
    const next = get().items.map((i) => (i.cartItemId === cartItemId ? { ...i, ...patch } : i));
    saveCart(next);
    set({ items: next });
  },

  clear: () => {
    saveCart([]);
    set({ items: [] });
  },
}));

export default useCartStore;
