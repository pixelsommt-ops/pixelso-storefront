import axios from 'axios';

// Default relatif ('/api') supaya request selalu ditujukan ke host yang sama dengan halaman
// yang sedang dibuka, lalu diteruskan proxy Vite ke backend ERP (lihat vite.config.js).
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/storefront',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('storefront_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
