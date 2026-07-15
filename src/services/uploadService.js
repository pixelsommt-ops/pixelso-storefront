import apiClient from './apiClient';

// kind: 'proof' (bukti transfer, dikompres dulu sebelum sampai sini) | 'design' (file desain, apa adanya)
export const upload = (dataUrl, filename, kind) =>
  apiClient.post('/uploads', { dataUrl, filename, kind }).then((res) => res.data);
