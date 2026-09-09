import apiClient from './apiClient';

export const getTestimonials = () => apiClient.get('/testimonials').then((res) => res.data);
