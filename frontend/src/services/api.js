import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  timeout: 10000,
})

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isLoginRequest = err.config?.url?.includes('/auth/login')
      if (!isLoginRequest) {
        console.log('401 error on non-login request, clearing token')
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        // Dispatching custom event so React can catch it without full page reload
        window.dispatchEvent(new Event('auth_unauthorized'))
      }
    }
    return Promise.reject(err)
  }
)

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

// Agent APIs
export const agentAPI = {
  getAll: () => api.get('/agents/status'),
  getById: (id) => api.get(`/agents/${id}`),
  start: (id) => api.post(`/agents/${id}/start`),
  stop: (id) => api.post(`/agents/${id}/stop`),
  restart: (id) => api.post(`/agents/${id}/restart`),
  getStats: () => api.get('/agents/stats/overview'),
}

// Job APIs
export const jobAPI = {
  getAll: (params) => api.get('/job', { params }),
  getById: (id) => api.get(`/job/${id}`),
  getByAgent: (agentId) => api.get(`/job?agent=${agentId}`),
  create: (data) => api.post('/job', data),
  start: (id) => api.post(`/job/${id}/start`),
  cancel: (id) => api.post(`/job/${id}/cancel`),
  getStats: () => api.get('/job/stats/overview'),
}

// Document APIs
export const documentAPI = {
  getAll: (params) => api.get('/document', { params }),
  getById: (id) => api.get(`/document/${id}`),
  upload: (formData) => api.post('/document/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  approve: (id, data) => api.post(`/document/${id}/approve`, data),
  reject: (id, reason) => api.post(`/document/${id}/reject`, { reason }),
}

// Candidate (VLE) APIs
export const candidateAPI = {
  getAll: (params) => api.get('/candidate', { params }),
  getById: (id) => api.get(`/candidate/${id}`),
  getVerification: (id) => api.get(`/candidate/${id}/verification`),
  verify: (id, data) => api.put(`/candidate/${id}/verification`, data),
  rejectVerification: (id, reason) => api.post(`/candidate/${id}/verification/reject`, { reason }),
  create: (formData) => api.post('/candidate/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/candidate/${id}`, data),
  getSubscription: (id) => api.get(`/candidate/${id}/subscription`),
}

// Dashboard Stats
export const dashboardAPI = {
  getStats: () => api.get('/job/stats/overview'),
  getActivity: (limit = 10) => api.get(`/job?limit=${limit}`),
}

export default api
