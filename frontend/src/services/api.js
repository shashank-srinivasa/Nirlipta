import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth endpoints
export const authAPI = {
  googleLogin: () => {
    window.location.href = `${API_URL}/api/v1/auth/google`;
  },
  
  facebookLogin: () => {
    window.location.href = `${API_URL}/api/v1/auth/facebook`;
  },
  
  logout: () => api.post('/auth/logout'),
  
  getProfile: () => api.get('/users/me'),
};

// Classes endpoints
export const classesAPI = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
};

// Schedules endpoints
export const schedulesAPI = {
  getAll: (params) => api.get('/schedules', { params }),
  getById: (id) => api.get(`/schedules/${id}`),
};

// Enrollments endpoints
export const enrollmentsAPI = {
  create: (data) => api.post('/enrollments', data),
  getMy: () => api.get('/enrollments/my'),
  cancel: (id) => api.delete(`/enrollments/${id}`),
};

// Content endpoints
export const contentAPI = {
  getByPage: (page) => api.get(`/content/${page}`),
};

// Admin endpoints
export const adminAPI = {
  // Classes management
  getAllClasses: () => api.get('/classes'), // Use public endpoint to get all
  createClass: (data) => api.post('/admin/classes', data),
  updateClass: (id, data) => api.put(`/admin/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/admin/classes/${id}`),
  
  // Schedules management
  getAllSchedules: (params) => api.get('/schedules', { params }),
  createSchedule: (data) => api.post('/admin/schedules', data),
  updateSchedule: (id, data) => api.put(`/admin/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`/admin/schedules/${id}`),
  
  // Content management
  getContent: (page) => api.get(`/content/${page}`),
  updateContent: (data) => api.put('/admin/content', data),
  
  // User management
  getAllUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  
  // Analytics
  getOverview: () => api.get('/admin/analytics/overview'),
};

