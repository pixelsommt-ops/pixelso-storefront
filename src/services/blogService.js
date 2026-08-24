import apiClient from './apiClient';

export const getPosts = () => apiClient.get('/blog').then((res) => res.data);
export const getPost = (slug) => apiClient.get(`/blog/${slug}`).then((res) => res.data);
