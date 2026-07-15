import apiClient from './apiClient';

export const getSettings = () => apiClient.get('/settings').then((res) => res.data);
