import axios from 'axios';

const API_URL = 'http://localhost:5000/api' || 'https://carrental-27s0.onrender.com/api';
const BASE_URL = API_URL.replace('/api', '');

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  sendVerification: (email) => api.post('/send-verification', { email }),
  verifyEmail: (email, code) => api.post('/verify-email', { email, code }),
  resetPassword: (email, newPassword) => api.post('/reset-password', { email, newPassword }),
};

export const vehicleAPI = {
  getAll: () => api.get('/vehicles'),
  create: (vehicleData) => {
    const token = localStorage.getItem('token');
    return api.post('/vehicles', vehicleData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
  },
  update: (id, vehicleData) => {
    const token = localStorage.getItem('token');
    return api.put(`/vehicles/${id}`, vehicleData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
  },
  delete: (id) => api.delete(`/vehicles/${id}`),
};

export const bookingAPI = {
  getAll: () => {
    const token = localStorage.getItem('token');
    return api.get('/bookings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },
  create: (bookingData) => api.post('/bookings', bookingData),
  update: (id, data) => api.put(`/bookings/${id}`, data),
};

export default api;
export { BASE_URL };