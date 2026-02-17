import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5000';
const API_BASE_URL = 'https://recruitment-offer-portal.onrender.com';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
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

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/createUser', userData),
};

// Candidate APIs
export const candidateAPI = {
  create: (candidateData) => {
    const config = candidateData instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return api.post('/createCandidate', candidateData, config);
  },
  getAll: (search = '', page = 1, limit = 10, emailStatus = 'all', status = 'all') => api.get('/getAllCandidates', {
    params: { search, page, limit, emailStatus, status }
  }),
  getStats: () => api.get('/candidateStats'),
  updateStatus: (id, status) => api.patch(`/updateCandidateStatus/${id}`, { status }),
  getById: (id) => api.get(`/getCandidate/${id}`),
  update: (id, candidateData) => {
    const config = candidateData instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return api.patch(`/updateCandidate/${id}`, candidateData, config);
  },
  delete: (id) => api.delete(`/deleteCandidate/${id}`),
};

// Email APIs
export const emailAPI = {
  sendOfferLetter: (candidateId) => api.post(`/sendEmail/${candidateId}`),
  sendBulkOfferLetters: (candidateIds) => api.post('/sendBulkEmail', { candidateIds }),
};

// Template APIs
export const templateAPI = {
  get: () => api.get('/emailTemplate'),
  update: (templateData) => api.patch('/emailTemplate', templateData),
};

export default api;
