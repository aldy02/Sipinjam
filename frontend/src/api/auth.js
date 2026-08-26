import api from './axios';

export const loginApi = (data) => api.post('/auth/login', data);
export const logoutApi = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const changePassword = (data) => api.put('/auth/change-password', data);