import apiClient from './apiClient';

export const register = (payload) => apiClient.post('/auth/register', payload).then((res) => res.data);
export const login = (email, password) => apiClient.post('/auth/login', { email, password }).then((res) => res.data);
export const googleLogin = (idToken) => apiClient.post('/auth/google', { idToken }).then((res) => res.data);
export const forgotPassword = (email) => apiClient.post('/auth/forgot-password', { email }).then((res) => res.data);
export const resetPassword = (token, password) =>
  apiClient.post('/auth/reset-password', { token, password }).then((res) => res.data);
