import axios from 'axios';
import API_CONFIG from '../config/api.js';

// Create axios instance with configuration
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add request timestamp for performance tracking
api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date().getTime() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh if 401 is due to expired token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Check if there's a refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // Try to get a new token
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}/auth/refresh-token`,
            { refreshToken }
          );
          
          if (response.data.token) {
            // Update token in storage
            localStorage.setItem('token', response.data.token);
            
            // Update authorization header
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
            
            // Retry the original request
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
      
      // If refresh failed or no refresh token, clear auth and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      // Only redirect if we're in a browser context and not a background request
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }

    // Handle network errors with retry logic
    if (!error.response && !originalRequest._retry && 
        originalRequest._retryCount < API_CONFIG.RETRY_ATTEMPTS) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      // Wait before retrying with exponential backoff
      const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, originalRequest._retryCount - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return api(originalRequest);
    }
    
    // Log error details
    console.error('API Error:', {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Return the error for handling by the caller
    return Promise.reject(error);

    return Promise.reject(error);
  }
);

// API service methods
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getMe: () => api.get('/api/auth/me'),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/api/auth/reset-password', { token, newPassword }),
  refreshToken: (refreshToken) => api.post('/api/auth/refresh-token', { refreshToken }),
  updateProfile: (userData) => api.put('/api/auth/profile', userData),
  changePassword: (passwordData) => api.post('/api/auth/change-password', passwordData),
  verifyEmail: (token) => api.get(`/api/auth/verify-email/${token}`),
  resendVerification: (email) => api.post('/api/auth/resend-verification', { email }),
};

export const estimatesAPI = {
  getAll: (params) => api.get('/api/estimates', { params }),
  getById: (id) => api.get(`/api/estimates/${id}`),
  create: (data) => api.post('/api/estimates', data),
  update: (id, data) => api.put(`/api/estimates/${id}`, data),
  delete: (id) => api.delete(`/api/estimates/${id}`),
  accept: (id) => api.post(`/api/estimates/${id}/accept`),
  reject: (id, reason) => api.post(`/api/estimates/${id}/reject`, { reason }),
  send: (id) => api.post(`/api/estimates/${id}/send`),
};

export const invoicesAPI = {
  getAll: (params) => api.get('/api/invoices', { params }),
  getById: (id) => api.get(`/api/invoices/${id}`),
  create: (data) => api.post('/api/invoices', data),
  createFromEstimate: (estimateId, data) => api.post(`/api/invoices/from-estimate/${estimateId}`, data),
  update: (id, data) => api.put(`/api/invoices/${id}`, data),
  delete: (id) => api.delete(`/api/invoices/${id}`),
  addPayment: (id, payment) => api.post(`/api/invoices/${id}/payments`, payment),
  generatePDF: (id) => api.get(`/api/invoices/${id}/pdf`, { responseType: 'blob' }),
  sendEmail: (id) => api.post(`/api/invoices/${id}/send-email`),
  sendWhatsApp: (id) => api.post(`/api/invoices/${id}/send-whatsapp`),
};

export const usersAPI = {
  getAll: (params) => api.get('/api/users', { params }),
  getById: (id) => api.get(`/api/users/${id}`),
  create: (data) => api.post('/api/users', data),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`),
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/api/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  changeStatus: (id, status) => api.patch(`/api/users/${id}/status`, { status }),
  getPendingTraders: () => api.get('/api/users/pending-traders'),
  approveTrader: (id) => api.post(`/api/users/${id}/approve`),
  rejectTrader: (id, reason) => api.post(`/api/users/${id}/reject`, { reason }),
  updateStatus: (id, status) => api.put(`/api/users/${id}/status`, { status }),
  delete: (id) => api.delete(`/api/users/${id}`),
};

export const statsAPI = {
  getPublicStats: () => api.get('/api/stats/public'),
  getDashboardStats: () => api.get('/api/stats/dashboard'),
};

export const contactAPI = {
  submitContactForm: (data) => api.post('/api/contact', data),
};

export default api;