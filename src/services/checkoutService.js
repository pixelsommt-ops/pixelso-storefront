import apiClient from './apiClient';

export const checkout = (payload) => apiClient.post('/checkout', payload).then((res) => res.data);
export const validateVoucher = (payload) => apiClient.post('/vouchers/validate', payload).then((res) => res.data);
