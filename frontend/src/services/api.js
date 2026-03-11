import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const register = (data) => api.post('/api/auth/register', data)
export const login = (data) => api.post('/api/auth/login', data)

// Clients
export const getClients = () => api.get('/api/clients')
export const createClient = (data) => api.post('/api/clients', data)
export const updateClient = (id, data) => api.put(`/api/clients/${id}`, data)
export const deleteClient = (id) => api.delete(`/api/clients/${id}`)

// Invoices
export const getInvoices = () => api.get('/api/invoices')
export const getInvoice = (id) => api.get(`/api/invoices/${id}`)
export const createInvoice = (data) => api.post('/api/invoices', data)
export const updateInvoice = (id, data) => api.put(`/api/invoices/${id}`, data)
export const updateInvoiceStatus = (id, status) => api.patch(`/api/invoices/${id}/status`, { status })
export const deleteInvoice = (id) => api.delete(`/api/invoices/${id}`)
export const getStats = () => api.get('/api/invoices/stats')
export const downloadPdf = (id) => api.get(`/api/invoices/${id}/pdf`, { responseType: 'blob' })

// Profile
export const getProfile = () => api.get('/api/profile')
export const updateProfile = (data) => api.put('/api/profile', data)

export default api
