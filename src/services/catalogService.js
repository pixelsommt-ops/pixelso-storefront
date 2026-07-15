import apiClient from './apiClient';

export const getCatalog = () => apiClient.get('/catalog').then((res) => res.data);
