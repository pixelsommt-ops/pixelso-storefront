import { create } from 'zustand';
import * as authService from '../services/authService';

const useAuthStore = create((set) => ({
  customer: JSON.parse(localStorage.getItem('storefront_customer') || 'null'),
  token: localStorage.getItem('storefront_token') || null,

  login: async (email, password) => {
    const { data } = await authService.login(email, password);
    localStorage.setItem('storefront_token', data.token);
    localStorage.setItem('storefront_customer', JSON.stringify(data.customer));
    set({ token: data.token, customer: data.customer });
  },

  register: async (payload) => {
    const { data } = await authService.register(payload);
    localStorage.setItem('storefront_token', data.token);
    localStorage.setItem('storefront_customer', JSON.stringify(data.customer));
    set({ token: data.token, customer: data.customer });
  },

  loginWithGoogle: async (idToken) => {
    const { data } = await authService.googleLogin(idToken);
    localStorage.setItem('storefront_token', data.token);
    localStorage.setItem('storefront_customer', JSON.stringify(data.customer));
    set({ token: data.token, customer: data.customer });
  },

  logout: () => {
    localStorage.removeItem('storefront_token');
    localStorage.removeItem('storefront_customer');
    set({ token: null, customer: null });
  },
}));

export default useAuthStore;
