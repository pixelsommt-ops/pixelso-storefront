import apiClient from './apiClient';

export const checkout = (payload) => apiClient.post('/checkout', payload).then((res) => res.data);
