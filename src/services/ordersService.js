import apiClient from './apiClient';

export const list = () => apiClient.get('/orders').then((res) => res.data);
export const getById = (poId) => apiClient.get(`/orders/${poId}`).then((res) => res.data);
