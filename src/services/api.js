import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 300000,
})

// Request Interception - Attach Token Every Request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Request Interception - Handle Token Expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not even Entry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh Token
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) throw new Error('No refresh token')

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } },
        )

        const newToken = res.data.access_token
        localStorage.setItem('access_token', newToken)

        // Update Pinia Store
        const authStore = useAuthStore()
        authStore.accessToken = newToken

        // Retry to Request new Token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh Token juga expired -> logout
        const authStore = useAuthStore()
        authStore.logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default {
  // Auth
  login(email, password) {
    return api.post('auth/login', { email, password })
  },
  getMe() {
    return api.get('/auth/me')
  },

  // Dashboard
  getStats(params = {}) {
    return api.get('/dashboard/stats', { params })
  },
  getFilters(params = {}) {
    return api.get('/dashboard/filters', { params })
  },
  getChartDevice(params = {}) {
    return api.get('/dashboard/chart/device', { params })
  },
  getChartRegion(params = {}) {
    return api.get('/dashboard/chart/region', { params })
  },
  getChartAceh(params = {}) {
    return api.get('/dashboard/chart/aceh', { params })
  },
  getChartTrend(params = {}) {
    return api.get('/dashboard/chart/trend', { params })
  },
  getMap(params = {}) {
    return api.get('/dashboard/map', { params })
  },
  getTop10(params = {}) {
    return api.get('/dashboard/top10', { params })
  },
  getAllAgen(params = {}) {
    return api.get('/dashboard/all-agen', { params })
  },
  getPareto(params = {}) {
    return api.get('/dashboard/chart/pareto', { params })
  },
  getAgenAktif(params = {}) {
    return api.get('/dashboard/stats/agen-aktif', { params })
  },

  // Upload
  uploadExcel(formData) {
    return api.post('/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
