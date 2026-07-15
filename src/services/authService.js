import apiClient from './apiClient';

export const register = (payload) => apiClient.post('/auth/register', payload).then((res) => res.data);
export const login = (email, password) => apiClient.post('/auth/login', { email, password }).then((res) => res.data);
