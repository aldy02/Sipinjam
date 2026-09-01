import api from './axios'

export const getUserList = (params) => api.get('/users', { params });
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const resetUserPassword = (id, data) => api.put(`/users/${id}/reset-password`, data);
export const deactivateUser = (id) => api.put(`/users/${id}/deactivate`);
export const activateUser = (id) => api.put(`/users/${id}/activate`);