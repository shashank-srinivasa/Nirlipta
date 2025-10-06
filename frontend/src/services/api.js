import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Error accessing localStorage:', err);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle errors and retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Log error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
      } catch (err) {
        console.error('Error clearing localStorage:', err);
      }
      
      // Only redirect if not already on home page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
      return Promise.reject(error);
    }

    // Retry logic for network errors or 5xx errors
    if (
      (!error.response || error.response.status >= 500) &&
      !originalRequest._retry &&
      originalRequest.method === 'get'
    ) {
      originalRequest._retry = true;
      
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        return await api(originalRequest);
      } catch (retryError) {
        console.error('Retry failed:', retryError);
        return Promise.reject(retryError);
      }
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

// Alias for consistency
export const enrollmentAPI = {
  enroll: (scheduleId) => api.post('/enrollments', { schedule_id: scheduleId }),
  getMyEnrollments: () => api.get('/enrollments/my'),
  cancel: (enrollmentId) => api.delete(`/enrollments/${enrollmentId}`),
};

// Content endpoints
export const contentAPI = {
  getByPage: (page) => api.get(`/content/${page}`),
};

// User endpoints
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    return api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateInstructorBio: (data) => api.put('/users/me/instructor-bio', data),
};

// Instructor endpoints
export const instructorAPI = {
  getAll: () => api.get('/instructors'),
  getAllAdmin: () => api.get('/admin/instructors'),
  update: (id, data) => api.put(`/admin/instructors/${id}`, data),
  updateOrder: (id, order) => api.put(`/admin/instructors/${id}/order`, { order }),
  promote: (id) => api.put(`/admin/instructors/${id}/promote`),
  remove: (id) => api.delete(`/admin/instructors/${id}`),
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

