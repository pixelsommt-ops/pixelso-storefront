import apiClient from './apiClient';

export const getItems = () => apiClient.get('/portfolio').then((res) => res.data);
export const getItem = (slug) => apiClient.get(`/portfolio/${slug}`).then((res) => res.data);
