import apiClient from './apiClient';

export const getPromos = () => apiClient.get('/promos').then((res) => res.data);
