import api from './axiosInstance';

export const getStudents = (params = {}) => api.get('/api/students', { params });
export const getStudent = (id) => api.get(`/api/students/${id}`);
export const createStudent = (data) => api.post('/api/students', data);
export const updateStudent = (id, data) => api.put(`/api/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/api/students/${id}`);
export const getStats = () => api.get('/api/stats');
export const checkHealth = () => api.get('/api/health');
