import api from './axios';

export const createPeminjaman = (data) => api.post('/peminjaman', data);
export const getPeminjamanList = (params) => api.get('/peminjaman', { params });
export const getPeminjamanById = (id) => api.get(`/peminjaman/${id}`);
export const kembalikanBarang = (id, data) => api.put(`/peminjaman/${id}/kembalikan`, data);